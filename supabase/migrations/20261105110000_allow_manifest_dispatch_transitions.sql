-- ====================================================================
-- FUNKY FOX ECOMMERCE PLATFORM
-- Migration: 20261105110000_allow_manifest_dispatch_transitions.sql
-- Description: Allow direct transitions from pre-dispatch states ('pending', 'confirmed')
--              to 'packed' upon automated logistics manifestation (AWB assignment),
--              while preserving all existing manual step-by-step transitions,
--              cancellation rules, and return rules.
-- Security: SECURITY DEFINER with SET search_path = '' (zero search_path)
-- ====================================================================

CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- If shipping_status is not being updated, allow the operation (e.g. updating notes, tracking details)
    IF OLD.shipping_status IS NOT DISTINCT FROM NEW.shipping_status THEN
        RETURN NEW;
    END IF;

    -- Valid Order Lifecycle State Machine:
    -- Standard progression: pending -> confirmed -> processing -> packed -> shipped -> out_for_delivery -> delivered
    -- Automated dispatch: pending / confirmed -> packed (when shipping label & AWB are generated)
    -- Cancellation rules: pending / confirmed / processing / packed -> cancelled
    -- Return rules: shipped / out_for_delivery / delivered -> returned
    IF OLD.shipping_status = 'pending' AND NEW.shipping_status IN ('confirmed', 'packed', 'cancelled') THEN
        RETURN NEW;
    ELSIF OLD.shipping_status = 'confirmed' AND NEW.shipping_status IN ('processing', 'packed', 'cancelled') THEN
        RETURN NEW;
    ELSIF OLD.shipping_status = 'processing' AND NEW.shipping_status IN ('packed', 'cancelled') THEN
        RETURN NEW;
    ELSIF OLD.shipping_status = 'packed' AND NEW.shipping_status IN ('shipped', 'cancelled') THEN
        RETURN NEW;
    ELSIF OLD.shipping_status = 'shipped' AND NEW.shipping_status IN ('out_for_delivery', 'delivered', 'returned') THEN
        RETURN NEW;
    ELSIF OLD.shipping_status = 'out_for_delivery' AND NEW.shipping_status IN ('delivered', 'returned') THEN
        RETURN NEW;
    ELSIF OLD.shipping_status = 'delivered' AND NEW.shipping_status IN ('returned') THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Illegal order status transition from "%" to "%" for order %',
            OLD.shipping_status, NEW.shipping_status, OLD.order_number
            USING ERRCODE = '22023';
    END IF;

    RETURN NEW;
END;
$$;

