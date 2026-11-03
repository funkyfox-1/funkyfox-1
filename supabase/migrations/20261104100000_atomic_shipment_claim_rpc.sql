-- ====================================================================
-- FUNKY FOX ECOMMERCE PLATFORM
-- Migration: 20261104100000_atomic_shipment_claim_rpc.sql (Hardened)
-- Description: Implement atomic dispatch claim, release, and finalize RPCs
--              for preventing concurrent duplicate Shiprocket dispatches.
-- Database: Supabase PostgreSQL (orders.id is TEXT)
-- Security: SECURITY DEFINER with SET search_path = '' (zero search_path)
-- Permissions: Strictly granted to service_role; revoked from public/anon/authenticated.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. ATOMIC DISPATCH CLAIM FUNCTION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_order_for_dispatch(
    p_order_id pg_catalog.text,
    p_claim_token pg_catalog.text,
    p_admin_name pg_catalog.text,
    p_lease_seconds pg_catalog.int4 DEFAULT 300
)
RETURNS pg_catalog.jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_order RECORD;
    v_now pg_catalog.timestamptz := pg_catalog.clock_timestamp();
    v_expires_at pg_catalog.timestamptz;
    v_current_token pg_catalog.text;
    v_current_expires pg_catalog.timestamptz;
    v_updated_details pg_catalog.jsonb;
BEGIN
    -- Validate input parameters
    IF p_order_id IS NULL OR pg_catalog.btrim(p_order_id) = '' THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_PARAMETER',
            'message', 'order_id cannot be null or empty'
        );
    END IF;

    IF p_claim_token IS NULL OR pg_catalog.btrim(p_claim_token) = '' THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_PARAMETER',
            'message', 'claim_token cannot be null or empty'
        );
    END IF;

    -- Row-level exclusive lock on the order
    SELECT
        id,
        order_number,
        payment_method,
        payment_status,
        fulfillment_status,
        shipping_status,
        shipment_details
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'ORDER_NOT_FOUND',
            'message', 'Order not found: ' || p_order_id
        );
    END IF;

    -- 1. Reject if order is already manifested / AWB assigned
    IF v_order.shipment_details->>'awbCode' IS NOT NULL AND pg_catalog.btrim(v_order.shipment_details->>'awbCode') <> '' THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'ALREADY_DISPATCHED',
            'message', 'Order is already manifested with AWB ' || (v_order.shipment_details->>'awbCode'),
            'shipment_details', v_order.shipment_details
        );
    END IF;

    -- 2. Reject if another valid, unexpired claim is actively held
    v_current_token := v_order.shipment_details->>'claim_token';
    IF v_order.shipment_details->>'claim_expires_at' IS NOT NULL THEN
        BEGIN
            v_current_expires := (v_order.shipment_details->>'claim_expires_at')::pg_catalog.timestamptz;
        EXCEPTION WHEN OTHERS THEN
            v_current_expires := NULL;
        END;
    END IF;

    IF v_current_token IS NOT NULL AND v_current_expires IS NOT NULL AND v_current_expires > v_now THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'CLAIM_ACTIVE',
            'message', 'Dispatch is currently in progress by another request',
            'claimed_by', v_order.shipment_details->>'claimed_by',
            'claim_expires_at', v_order.shipment_details->>'claim_expires_at'
        );
    END IF;

    -- 3. Calculate lease expiration (bounded between 60 and 900 seconds, default 300s)
    v_expires_at := v_now + (pg_catalog.greatest(60, pg_catalog.least(pg_catalog.coalesce(p_lease_seconds, 300), 900)) || ' seconds')::pg_catalog.interval;

    -- 4. Atomically persist claim while preserving existing shipment identifiers (e.g., shipmentId from previous retry)
    v_updated_details := pg_catalog.coalesce(v_order.shipment_details, '{}'::pg_catalog.jsonb) || pg_catalog.jsonb_build_object(
        'claim_token', p_claim_token,
        'claimed_at', v_now,
        'claimed_by', pg_catalog.coalesce(pg_catalog.nullif(pg_catalog.btrim(p_admin_name), ''), 'Admin'),
        'claim_expires_at', v_expires_at
    );

    UPDATE public.orders
    SET
        shipment_details = v_updated_details,
        updated_at = v_now
    WHERE id = p_order_id;

    RETURN pg_catalog.jsonb_build_object(
        'success', true,
        'order_id', v_order.id,
        'order_number', v_order.order_number,
        'claim_token', p_claim_token,
        'claim_expires_at', v_expires_at,
        'existing_shipment_id', v_order.shipment_details->>'shipmentId',
        'existing_shiprocket_order_id', v_order.shipment_details->>'shiprocketOrderId'
    );
END;
$$;

-- --------------------------------------------------------------------
-- 2. RELEASE DISPATCH CLAIM (ON FAILURE OR RETRY)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.release_order_dispatch_claim(
    p_order_id pg_catalog.text,
    p_claim_token pg_catalog.text,
    p_error_message pg_catalog.text DEFAULT NULL,
    p_shipment_id pg_catalog.text DEFAULT NULL,
    p_shiprocket_order_id pg_catalog.text DEFAULT NULL
)
RETURNS pg_catalog.jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_order RECORD;
    v_now pg_catalog.timestamptz := pg_catalog.clock_timestamp();
    v_updated_details pg_catalog.jsonb;
    v_current_token pg_catalog.text;
BEGIN
    IF p_order_id IS NULL OR pg_catalog.btrim(p_order_id) = '' THEN
        RETURN pg_catalog.jsonb_build_object('success', false, 'error_code', 'INVALID_PARAMETER', 'message', 'order_id cannot be null or empty');
    END IF;

    IF p_claim_token IS NULL OR pg_catalog.btrim(p_claim_token) = '' THEN
        RETURN pg_catalog.jsonb_build_object('success', false, 'error_code', 'INVALID_PARAMETER', 'message', 'claim_token cannot be null or empty');
    END IF;

    SELECT
        id,
        shipment_details
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN pg_catalog.jsonb_build_object('success', false, 'error_code', 'ORDER_NOT_FOUND', 'message', 'Order not found');
    END IF;

    v_current_token := v_order.shipment_details->>'claim_token';

    -- Issue 5: Strictly require matching claim token; cannot clear or modify another request's claim
    IF v_current_token IS NULL OR v_current_token <> p_claim_token THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'CLAIM_TOKEN_MISMATCH',
            'message', 'Cannot release: claim token does not match active claim holder'
        );
    END IF;

    -- If order already has an AWB assigned, do not clear or modify anything
    IF v_order.shipment_details->>'awbCode' IS NOT NULL AND pg_catalog.btrim(v_order.shipment_details->>'awbCode') <> '' THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'ALREADY_DISPATCHED',
            'message', 'Order is already manifested with AWB; cannot release completed shipment'
        );
    END IF;

    -- Remove ephemeral claim keys while preserving shipment details
    v_updated_details := (v_order.shipment_details - 'claim_token' - 'claim_expires_at' - 'claimed_at' - 'claimed_by');

    -- Issue 6: Preserve partial Shiprocket shipment identifiers across retries
    IF p_shipment_id IS NOT NULL AND pg_catalog.btrim(p_shipment_id) <> '' THEN
        v_updated_details := v_updated_details || pg_catalog.jsonb_build_object('shipmentId', pg_catalog.btrim(p_shipment_id));
    END IF;
    IF p_shiprocket_order_id IS NOT NULL AND pg_catalog.btrim(p_shiprocket_order_id) <> '' THEN
        v_updated_details := v_updated_details || pg_catalog.jsonb_build_object('shiprocketOrderId', pg_catalog.btrim(p_shiprocket_order_id));
    END IF;

    IF p_error_message IS NOT NULL AND pg_catalog.btrim(p_error_message) <> '' THEN
        v_updated_details := v_updated_details || pg_catalog.jsonb_build_object(
            'last_dispatch_error', pg_catalog.btrim(p_error_message),
            'last_dispatch_attempt_at', v_now
        );
    END IF;

    UPDATE public.orders
    SET
        shipment_details = v_updated_details,
        updated_at = v_now
    WHERE id = p_order_id;

    RETURN pg_catalog.jsonb_build_object('success', true, 'message', 'Claim released successfully');
END;
$$;

-- --------------------------------------------------------------------
-- 3. FINALIZE DISPATCH (ATOMIC MANIFEST & TIMELINE UPDATE)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.finalize_order_dispatch(
    p_order_id pg_catalog.text,
    p_claim_token pg_catalog.text,
    p_shipment_details pg_catalog.jsonb,
    p_target_shipping_status pg_catalog.text,
    p_timeline_entry pg_catalog.jsonb
)
RETURNS pg_catalog.jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_order RECORD;
    v_now pg_catalog.timestamptz := pg_catalog.clock_timestamp();
    v_updated_timeline pg_catalog.jsonb;
    v_final_details pg_catalog.jsonb;
    v_current_token pg_catalog.text;
    v_current_expires pg_catalog.timestamptz;
BEGIN
    -- Validate required input parameters
    IF p_order_id IS NULL OR pg_catalog.btrim(p_order_id) = '' THEN
        RETURN pg_catalog.jsonb_build_object('success', false, 'error_code', 'INVALID_PARAMETER', 'message', 'order_id cannot be null or empty');
    END IF;

    -- Issue 4: Require non-null, valid claim token
    IF p_claim_token IS NULL OR pg_catalog.btrim(p_claim_token) = '' THEN
        RETURN pg_catalog.jsonb_build_object('success', false, 'error_code', 'INVALID_CLAIM_TOKEN', 'message', 'claim_token cannot be null or empty');
    END IF;

    -- Issue 4: Validate target shipping status against orders table CHECK constraint
    IF p_target_shipping_status IS NOT NULL AND pg_catalog.btrim(p_target_shipping_status) <> '' THEN
        IF p_target_shipping_status NOT IN ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned') THEN
            RETURN pg_catalog.jsonb_build_object(
                'success', false,
                'error_code', 'INVALID_STATUS',
                'message', 'Target shipping status "' || p_target_shipping_status || '" is not a valid order status'
            );
        END IF;
    END IF;

    SELECT
        id,
        order_number,
        shipping_status,
        fulfillment_status,
        shipment_details,
        timeline
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN pg_catalog.jsonb_build_object('success', false, 'error_code', 'ORDER_NOT_FOUND', 'message', 'Order not found');
    END IF;

    -- Issue 1 & 4: Expired or rogue claim cannot overwrite an existing completed AWB
    IF v_order.shipment_details->>'awbCode' IS NOT NULL AND pg_catalog.btrim(v_order.shipment_details->>'awbCode') <> '' THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'ALREADY_DISPATCHED',
            'message', 'Order is already manifested with AWB ' || (v_order.shipment_details->>'awbCode'),
            'shipment_details', v_order.shipment_details
        );
    END IF;

    -- Issue 4: Require matching claim token
    v_current_token := v_order.shipment_details->>'claim_token';
    IF v_current_token IS NULL OR v_current_token <> p_claim_token THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'CLAIM_TOKEN_MISMATCH',
            'message', 'Claim token mismatch. Another request claimed the dispatch or the lease was lost.'
        );
    END IF;

    -- Issue 4: Require unexpired claim
    IF v_order.shipment_details->>'claim_expires_at' IS NULL THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'CLAIM_EXPIRED',
            'message', 'Dispatch claim has no valid expiration timestamp'
        );
    END IF;

    BEGIN
        v_current_expires := (v_order.shipment_details->>'claim_expires_at')::pg_catalog.timestamptz;
    EXCEPTION WHEN OTHERS THEN
        v_current_expires := NULL;
    END;

    IF v_current_expires IS NULL OR v_current_expires < v_now THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'CLAIM_EXPIRED',
            'message', 'Dispatch claim has expired'
        );
    END IF;

    -- Strip ephemeral claim fields from final shipment details
    v_final_details := (pg_catalog.coalesce(v_order.shipment_details, '{}'::pg_catalog.jsonb) || pg_catalog.coalesce(p_shipment_details, '{}'::pg_catalog.jsonb))
                       - 'claim_token' - 'claim_expires_at' - 'claimed_at' - 'claimed_by';

    -- Prepare timeline update
    IF p_timeline_entry IS NOT NULL THEN
        IF v_order.timeline IS NULL OR pg_catalog.jsonb_typeof(v_order.timeline) <> 'array' THEN
            v_updated_timeline := pg_catalog.jsonb_build_array(p_timeline_entry);
        ELSE
            v_updated_timeline := v_order.timeline || pg_catalog.jsonb_build_array(p_timeline_entry);
        END IF;
    ELSE
        v_updated_timeline := pg_catalog.coalesce(v_order.timeline, '[]'::pg_catalog.jsonb);
    END IF;

    -- Apply update (triggers trg_validate_order_status before update if shipping_status changes)
    UPDATE public.orders
    SET
        shipment_details = v_final_details,
        timeline = v_updated_timeline,
        fulfillment_status = 'fulfilled',
        shipping_status = CASE
            WHEN p_target_shipping_status IS NOT NULL AND pg_catalog.btrim(p_target_shipping_status) <> '' THEN p_target_shipping_status
            ELSE shipping_status
        END,
        updated_at = v_now
    WHERE id = p_order_id;

    RETURN pg_catalog.jsonb_build_object(
        'success', true,
        'order_id', v_order.id,
        'shipping_status', CASE
            WHEN p_target_shipping_status IS NOT NULL AND pg_catalog.btrim(p_target_shipping_status) <> '' THEN p_target_shipping_status
            ELSE v_order.shipping_status
        END,
        'fulfillment_status', 'fulfilled',
        'shipment_details', v_final_details
    );
END;
$$;

-- --------------------------------------------------------------------
-- 4. RESTRICT EXECUTION PERMISSIONS
-- --------------------------------------------------------------------
-- Revoke execution from public, anon, and authenticated roles
REVOKE ALL ON FUNCTION public.claim_order_for_dispatch(pg_catalog.text, pg_catalog.text, pg_catalog.text, pg_catalog.int4) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_order_dispatch_claim(pg_catalog.text, pg_catalog.text, pg_catalog.text, pg_catalog.text, pg_catalog.text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finalize_order_dispatch(pg_catalog.text, pg_catalog.text, pg_catalog.jsonb, pg_catalog.text, pg_catalog.jsonb) FROM PUBLIC, anon, authenticated;

-- Grant execution strictly to service_role (Edge Functions with service-role key)
GRANT EXECUTE ON FUNCTION public.claim_order_for_dispatch(pg_catalog.text, pg_catalog.text, pg_catalog.text, pg_catalog.int4) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_order_dispatch_claim(pg_catalog.text, pg_catalog.text, pg_catalog.text, pg_catalog.text, pg_catalog.text) TO service_role;
GRANT EXECUTE ON FUNCTION public.finalize_order_dispatch(pg_catalog.text, pg_catalog.text, pg_catalog.jsonb, pg_catalog.text, pg_catalog.jsonb) TO service_role;
