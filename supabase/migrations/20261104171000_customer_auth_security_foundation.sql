-- ====================================================================
-- FUNKY FOX ECOMMERCE PLATFORM
-- Migration: 20261104171000_customer_auth_security_foundation.sql
-- Description: Phase 2B.1 — Secure Database Foundation for Customer
--              Authentication, Profile Provisioning, Order Ownership,
--              Hardened Checkout RPC, Cancellation RPC, Wishlist,
--              Reviews, and Customer-Scoped Row Level Security (RLS).
-- Target: Supabase PostgreSQL (Apply via Supabase Dashboard -> SQL Editor)
-- Idempotent & Non-Destructive: Safe to run multiple times.
-- ====================================================================

BEGIN;

-- ====================================================================
-- 1. EXTEND CUSTOMERS & ORDERS WITH AUTH_USER_ID
-- ====================================================================

-- 1.1 Add auth_user_id to public.customers referencing auth.users(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'auth_user_id'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enforce uniqueness of auth_user_id for registered customer records
CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_auth_user_id
ON public.customers(auth_user_id)
WHERE auth_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id
ON public.customers(auth_user_id);

-- Ensure updated_at exists on customers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- Replace table-level UNIQUE constraint on customers(email) with a partial unique index.
-- This allows historical guest records (auth_user_id IS NULL) to coexist with
-- registered customer accounts without unique constraint collisions, while guaranteeing
-- that no two registered customer accounts can share the same email address.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
          AND table_name = 'customers'
          AND constraint_name = 'customers_email_key'
    ) THEN
        ALTER TABLE public.customers DROP CONSTRAINT customers_email_key;
    END IF;
END $$;

DROP INDEX IF EXISTS public.customers_email_key;
DROP INDEX IF EXISTS public.idx_customers_email;

-- Case-insensitive lookup index on all customer emails
CREATE INDEX IF NOT EXISTS idx_customers_email
ON public.customers(pg_catalog.lower(email));

-- Unique constraint ensuring exactly one registered account per email
CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_registered_email
ON public.customers(pg_catalog.lower(email))
WHERE auth_user_id IS NOT NULL;

-- 1.2 Add auth_user_id to public.orders referencing auth.users(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'auth_user_id'
    ) THEN
        ALTER TABLE public.orders
        ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_auth_user_id
ON public.orders(auth_user_id);


-- ====================================================================
-- 2. FIELD PROTECTION TRIGGER FOR CUSTOMERS TABLE
-- ====================================================================

-- Customers must not be able to alter their auth_user_id, email, total_orders,
-- total_spent, last_order_date, or internal notes via direct table updates.
CREATE OR REPLACE FUNCTION public.protect_customer_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Allow service_role and admins full update clearance
    IF auth.role() = 'service_role' OR public.is_admin() THEN
        NEW.updated_at := pg_catalog.now();
        RETURN NEW;
    END IF;

    -- For normal authenticated customers, protect immutable and privileged columns
    NEW.id := OLD.id;
    NEW.auth_user_id := OLD.auth_user_id;
    NEW.email := OLD.email; -- Email changes must occur through Supabase Auth flow
    NEW.total_orders := OLD.total_orders;
    NEW.total_spent := OLD.total_spent;
    NEW.last_order_date := OLD.last_order_date;
    NEW.notes := OLD.notes;
    NEW.created_at := OLD.created_at;
    NEW.updated_at := pg_catalog.now();

    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.protect_customer_fields() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_protect_customer_fields ON public.customers;
CREATE TRIGGER trg_protect_customer_fields
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.protect_customer_fields();


-- ====================================================================
-- 3. CUSTOMER PROFILE PROVISIONING TRIGGER (auth.users -> public.customers)
-- ====================================================================

-- Safely provisions a dedicated customer profile for every newly registered
-- auth user without automatically claiming historical guest records based on email.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_customer_id TEXT;
    v_name TEXT;
    v_phone TEXT;
    v_clean_email TEXT;
BEGIN
    v_clean_email := pg_catalog.lower(pg_catalog.btrim(NEW.email));

    -- Extract name from user metadata or fallback to email prefix
    v_name := coalesce(
        nullif(pg_catalog.btrim(NEW.raw_user_meta_data->>'name'), ''),
        nullif(pg_catalog.btrim(NEW.raw_user_meta_data->>'full_name'), ''),
        nullif(pg_catalog.btrim(NEW.raw_user_meta_data->>'first_name'), ''),
        pg_catalog.split_part(v_clean_email, '@', 1)
    );

    -- Extract phone from metadata or auth.users phone
    v_phone := coalesce(
        nullif(pg_catalog.btrim(NEW.raw_user_meta_data->>'phone'), ''),
        nullif(pg_catalog.btrim(NEW.phone), '')
    );

    -- Generate deterministic, unique customer ID derived from auth UUID
    v_customer_id := 'cust-' || pg_catalog.replace(NEW.id::text, '-', '');

    -- Insert dedicated registered customer profile.
    -- Historical guest customer records remain isolated (auth_user_id IS NULL)
    -- and are never claimed automatically by email matching.
    INSERT INTO public.customers (
        id,
        auth_user_id,
        name,
        email,
        phone,
        addresses,
        total_orders,
        total_spent,
        created_at,
        updated_at
    ) VALUES (
        v_customer_id,
        NEW.id,
        v_name,
        v_clean_email,
        v_phone,
        '[]'::jsonb,
        0,
        0.00,
        pg_catalog.now(),
        pg_catalog.now()
    )
    ON CONFLICT (id) DO UPDATE SET
        auth_user_id = EXCLUDED.auth_user_id,
        name = coalesce(nullif(EXCLUDED.name, ''), public.customers.name),
        phone = coalesce(nullif(EXCLUDED.phone, ''), public.customers.phone),
        updated_at = pg_catalog.now()
    WHERE public.customers.auth_user_id = NEW.id;

    RETURN NEW;
EXCEPTION WHEN unique_violation THEN
    -- If a profile already exists for this auth_user_id or registered email,
    -- update the existing record to guarantee a recoverable profile.
    UPDATE public.customers
    SET auth_user_id = NEW.id,
        name = coalesce(nullif(v_name, ''), name),
        phone = coalesce(nullif(v_phone, ''), phone),
        updated_at = pg_catalog.now()
    WHERE auth_user_id = NEW.id
       OR (pg_catalog.lower(email) = v_clean_email AND auth_user_id = NEW.id);

    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Bind trigger to auth.users AFTER INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- ====================================================================
-- 4. NORMALIZED CUSTOMER ADDRESSES TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id
ON public.customer_addresses(user_id);

-- Enforce at the database level that each authenticated user can have at most one default address
CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_addresses_default
ON public.customer_addresses(user_id)
WHERE is_default = true;

ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Demote previous default address when a new default address is selected
CREATE OR REPLACE FUNCTION public.handle_default_customer_address()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NEW.is_default THEN
        UPDATE public.customer_addresses
        SET is_default = false,
            updated_at = pg_catalog.now()
        WHERE user_id = NEW.user_id
          AND is_default = true
          AND id <> coalesce(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    END IF;
    NEW.updated_at := pg_catalog.now();
    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_default_customer_address() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_handle_default_customer_address ON public.customer_addresses;
CREATE TRIGGER trg_handle_default_customer_address
BEFORE INSERT OR UPDATE ON public.customer_addresses
FOR EACH ROW
EXECUTE FUNCTION public.handle_default_customer_address();


-- ====================================================================
-- 5. WISHLIST ITEMS TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_wishlist_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON public.wishlist_items(product_id);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;


-- ====================================================================
-- 6. PRODUCT REVIEWS TABLE & MODERATION TRIGGER
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    fit_feedback TEXT CHECK (fit_feedback IN ('runs_small', 'true_to_size', 'runs_large')),
    is_verified_purchase BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_product_reviews_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON public.product_reviews(status);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Security trigger: enforce that customer cannot self-approve reviews or forge verified purchase status.
-- Verified purchase strictly requires that the submitted order_id belongs to auth.uid(), has
-- shipping_status = 'delivered', and contains the reviewed product in order_items.
CREATE OR REPLACE FUNCTION public.validate_review_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_is_qualifying BOOLEAN := false;
BEGIN
    -- Service role and store admins have full moderation clearance
    IF auth.role() = 'service_role' OR public.is_admin() THEN
        NEW.updated_at := pg_catalog.now();
        RETURN NEW;
    END IF;

    -- Enforce caller ownership
    NEW.user_id := auth.uid();

    -- Moderation status must always reset to 'pending' on user submit/update
    NEW.status := 'pending';

    -- Validate verified purchase status strictly against qualifying orders
    IF NEW.order_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1
            FROM public.orders o
            JOIN public.order_items oi ON oi.order_id = o.id
            WHERE o.id = NEW.order_id
              AND o.auth_user_id = auth.uid()
              AND o.shipping_status = 'delivered'
              AND oi.product_id = NEW.product_id
        ) INTO v_is_qualifying;

        IF v_is_qualifying THEN
            NEW.is_verified_purchase := true;
        ELSE
            -- Invalid or non-matching order_id cannot grant verified purchase status
            NEW.order_id := NULL;
            NEW.is_verified_purchase := false;
        END IF;
    ELSE
        NEW.is_verified_purchase := false;
    END IF;

    NEW.updated_at := pg_catalog.now();
    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.validate_review_submission() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_validate_review_submission ON public.product_reviews;
CREATE TRIGGER trg_validate_review_submission
BEFORE INSERT OR UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.validate_review_submission();


-- ====================================================================
-- 7. COMPLETE ROW LEVEL SECURITY POLICIES
-- ====================================================================

-- 7.1 CUSTOMERS
DROP POLICY IF EXISTS "Customers can read own profile" ON public.customers;
CREATE POLICY "Customers can read own profile" ON public.customers
    FOR SELECT TO authenticated
    USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Customers can update own profile" ON public.customers;
CREATE POLICY "Customers can update own profile" ON public.customers
    FOR UPDATE TO authenticated
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Admin full access customers" ON public.customers;
CREATE POLICY "Admin full access customers" ON public.customers
    FOR ALL USING (public.is_admin());

-- 7.2 ORDERS
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders" ON public.orders
    FOR SELECT TO authenticated
    USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Admin full access orders" ON public.orders;
CREATE POLICY "Admin full access orders" ON public.orders
    FOR ALL USING (public.is_admin());

-- 7.3 ORDER ITEMS
DROP POLICY IF EXISTS "Customers can view own order items" ON public.order_items;
CREATE POLICY "Customers can view own order items" ON public.order_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE public.orders.id = public.order_items.order_id
              AND public.orders.auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admin full access order items" ON public.order_items;
CREATE POLICY "Admin full access order items" ON public.order_items
    FOR ALL USING (public.is_admin());

-- 7.4 CUSTOMER ADDRESSES
DROP POLICY IF EXISTS "Customers can manage own addresses" ON public.customer_addresses;
CREATE POLICY "Customers can manage own addresses" ON public.customer_addresses
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin full access addresses" ON public.customer_addresses;
CREATE POLICY "Admin full access addresses" ON public.customer_addresses
    FOR ALL USING (public.is_admin());

-- 7.5 WISHLIST ITEMS
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlist_items;
CREATE POLICY "Users can view own wishlist" ON public.wishlist_items
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can add to own wishlist" ON public.wishlist_items;
CREATE POLICY "Users can add to own wishlist" ON public.wishlist_items
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can remove from own wishlist" ON public.wishlist_items;
CREATE POLICY "Users can remove from own wishlist" ON public.wishlist_items
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin full access wishlist" ON public.wishlist_items;
CREATE POLICY "Admin full access wishlist" ON public.wishlist_items
    FOR ALL USING (public.is_admin());

-- 7.6 PRODUCT REVIEWS
DROP POLICY IF EXISTS "Public read approved reviews" ON public.product_reviews;
CREATE POLICY "Public read approved reviews" ON public.product_reviews
    FOR SELECT
    USING (status = 'approved');

DROP POLICY IF EXISTS "Users view own reviews" ON public.product_reviews;
CREATE POLICY "Users view own reviews" ON public.product_reviews
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own review" ON public.product_reviews;
CREATE POLICY "Users insert own review" ON public.product_reviews
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own review" ON public.product_reviews;
CREATE POLICY "Users update own review" ON public.product_reviews
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own review" ON public.product_reviews;
CREATE POLICY "Users delete own review" ON public.product_reviews
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin full access reviews" ON public.product_reviews;
CREATE POLICY "Admin full access reviews" ON public.product_reviews
    FOR ALL USING (public.is_admin());


-- ====================================================================
-- 8. HARDENED CHECKOUT RPC (create_customer_order)
-- ====================================================================

CREATE OR REPLACE FUNCTION public.create_customer_order(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    -- Authentication Context
    v_caller_id UUID;
    v_caller_role TEXT;
    v_jwt_email TEXT;
    v_email_is_confirmed BOOLEAN := true;
    v_order_auth_user_id UUID := NULL;

    -- Idempotency and Locking
    v_idempotency_key TEXT;
    v_request_hash TEXT;
    v_idem_rec RECORD;

    -- Identifiers
    v_order_id TEXT;
    v_order_number TEXT;
    v_order_number_attempt INT;
    v_err_constraint TEXT;

    -- Customer & Address Inputs
    v_customer_info JSONB;
    v_shipping_address JSONB;
    v_items JSONB;
    v_customer_id TEXT := NULL;
    v_registered_customer_id TEXT := NULL;
    v_customer_email TEXT;
    v_customer_name TEXT;
    v_customer_phone TEXT;
    v_phone_digits TEXT;
    v_payment_method TEXT;
    v_coupon_code TEXT;

    v_street TEXT;
    v_city TEXT;
    v_state TEXT;
    v_pincode TEXT;
    v_country TEXT;

    -- Line Items Processing
    v_elem JSONB;
    v_item_raw_prod_id TEXT;
    v_item_raw_qty_str TEXT;
    v_item_raw_qty INT;
    v_item_rec RECORD;
    v_matching_variants_count INT;
    v_has_variants BOOLEAN;
    v_prod RECORD;
    v_variant RECORD;
    v_unit_price NUMERIC(10, 2);
    v_item_id TEXT;
    v_validated_items JSONB := '[]'::jsonb;

    -- Pricing, Discounts & Shipping
    v_coupon RECORD;
    v_subtotal NUMERIC(12, 2) := 0.00;
    v_discount NUMERIC(12, 2) := 0.00;
    v_shipping_charge NUMERIC(12, 2) := 0.00;
    v_tax NUMERIC(12, 2) := 0.00;
    v_total NUMERIC(12, 2) := 0.00;

    v_free_shipping_threshold NUMERIC(10, 2) := 1499.00;
    v_flat_shipping_fee NUMERIC(10, 2) := 99.00;
    v_tax_rate NUMERIC(5, 2) := 0.00;

    -- Abuse Prevention Counters
    v_recent_orders_count INT;
    v_customer_coupon_uses INT;
BEGIN
    -- 1. Identify Caller Security Context from Supabase JWT
    v_caller_id := auth.uid();
    v_caller_role := coalesce(auth.role(), 'anon');

    -- 2. Validate Non-Empty, Well-Formed Idempotency Key
    v_idempotency_key := nullif(pg_catalog.btrim(coalesce(payload->>'idempotencyKey', '')), '');
    IF v_idempotency_key IS NULL OR pg_catalog.char_length(v_idempotency_key) < 16 OR pg_catalog.char_length(v_idempotency_key) > 128 THEN
        RAISE EXCEPTION 'A valid, non-empty idempotency key is required (16–128 characters)';
    END IF;

    IF v_idempotency_key !~ '^[A-Za-z0-9_\-]+$' THEN
        RAISE EXCEPTION 'Idempotency key contains invalid characters (allowed: alphanumeric, hyphen, underscore)';
    END IF;

    -- 3. Transaction-Scoped Advisory Serialization Lock
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('checkout_idempotency:' || v_idempotency_key));

    -- 4. Extract and Sanitize Core Customer Contact Inputs
    v_customer_info := payload->'customer';
    IF v_customer_info IS NULL OR pg_catalog.jsonb_typeof(v_customer_info) <> 'object' THEN
        RAISE EXCEPTION 'Customer information is required and must be a valid JSON object';
    END IF;

    v_customer_name := pg_catalog.btrim(coalesce(v_customer_info->>'name', ''));
    v_customer_phone := pg_catalog.btrim(coalesce(v_customer_info->>'phone', ''));

    IF v_customer_name = '' OR pg_catalog.char_length(v_customer_name) < 2 OR pg_catalog.char_length(v_customer_name) > 150 THEN
        RAISE EXCEPTION 'Customer full name is required (2–150 characters)';
    END IF;

    v_phone_digits := pg_catalog.regexp_replace(v_customer_phone, '[^0-9]', '', 'g');
    IF pg_catalog.char_length(v_phone_digits) < 10 OR pg_catalog.char_length(v_phone_digits) > 15 THEN
        RAISE EXCEPTION 'Customer phone number must contain between 10 and 15 digits';
    END IF;

    -- 5. Cryptographic Caller Identity Binding & Customer Profile Resolution
    IF v_caller_id IS NOT NULL THEN
        -- ====================================================================
        -- 5A. AUTHENTICATED CHECKOUT:
        -- ====================================================================
        -- Ownership is derived EXCLUSIVELY from auth.uid()
        v_order_auth_user_id := v_caller_id;

        -- Verify caller email from auth.users (authoritative source of truth)
        SELECT
            pg_catalog.lower(pg_catalog.btrim(email)),
            (email_confirmed_at IS NOT NULL OR confirmed_at IS NOT NULL)
        INTO v_jwt_email, v_email_is_confirmed
        FROM auth.users
        WHERE id = v_caller_id;

        IF v_jwt_email IS NULL OR v_jwt_email = '' THEN
            v_jwt_email := pg_catalog.lower(pg_catalog.btrim(coalesce(auth.jwt()->>'email', '')));
        END IF;

        IF v_jwt_email IS NULL OR v_jwt_email = '' THEN
            RAISE EXCEPTION 'Authenticated user lacks a valid email address in auth.users';
        END IF;

        -- Check email confirmation policy: If auth.users indicates unconfirmed email and JWT is not verified:
        IF v_email_is_confirmed IS FALSE AND coalesce((auth.jwt()->>'email_verified')::boolean, false) IS FALSE THEN
            RAISE EXCEPTION 'Email verification required: Please verify your email address before placing an order.'
                USING ERRCODE = '42501';
        END IF;

        -- Authoritative email overrides any client-supplied customer email
        v_customer_email := v_jwt_email;

        -- Look up customer profile strictly by auth_user_id (never associate with another auth user's record)
        SELECT id INTO v_customer_id
        FROM public.customers
        WHERE auth_user_id = v_caller_id
        LIMIT 1;

        -- If customer profile was not yet provisioned, safely provision it now
        IF v_customer_id IS NULL THEN
            v_customer_id := 'cust-' || pg_catalog.replace(v_caller_id::text, '-', '');
            INSERT INTO public.customers (
                id,
                auth_user_id,
                name,
                email,
                phone,
                addresses,
                total_orders,
                total_spent,
                created_at,
                updated_at
            ) VALUES (
                v_customer_id,
                v_caller_id,
                v_customer_name,
                v_jwt_email,
                v_customer_phone,
                '[]'::jsonb,
                0,
                0.00,
                pg_catalog.now(),
                pg_catalog.now()
            )
            ON CONFLICT (id) DO UPDATE SET
                auth_user_id = EXCLUDED.auth_user_id,
                name = coalesce(nullif(EXCLUDED.name, ''), public.customers.name),
                phone = coalesce(nullif(EXCLUDED.phone, ''), public.customers.phone),
                updated_at = pg_catalog.now()
            WHERE public.customers.auth_user_id = v_caller_id;
        ELSE
            -- Keep customer name and phone up to date if currently blank
            UPDATE public.customers
            SET name = coalesce(nullif(name, ''), v_customer_name),
                phone = coalesce(nullif(phone, ''), v_customer_phone),
                updated_at = pg_catalog.now()
            WHERE id = v_customer_id;
        END IF;

    ELSE
        -- ====================================================================
        -- 5B. GUEST CHECKOUT:
        -- ====================================================================
        -- Caller is anonymous. Orders placed as guest have auth_user_id = NULL.
        v_order_auth_user_id := NULL;

        v_customer_email := pg_catalog.lower(pg_catalog.btrim(coalesce(v_customer_info->>'email', '')));
        IF v_customer_email = '' OR pg_catalog.char_length(v_customer_email) < 5 OR pg_catalog.char_length(v_customer_email) > 255 THEN
            RAISE EXCEPTION 'A valid customer email address is required (5–255 characters)';
        END IF;

        IF v_customer_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' THEN
            RAISE EXCEPTION 'Invalid customer email address format: "%"', v_customer_email;
        END IF;

        -- Check if email belongs to a registered customer account (auth_user_id IS NOT NULL)
        SELECT id INTO v_registered_customer_id
        FROM public.customers
        WHERE pg_catalog.lower(email) = v_customer_email
          AND auth_user_id IS NOT NULL
        LIMIT 1;

        IF v_registered_customer_id IS NOT NULL THEN
            -- ================================================================
            -- SCENARIO C.2: Guest email matches a registered account
            -- ================================================================
            -- SECURITY: A guest cannot claim, modify, access, or contaminate
            -- a registered customer's profile or order history.
            -- Setting customer_id := NULL satisfies the nullable foreign key
            -- constraint (orders.customer_id REFERENCES customers(id) ON DELETE SET NULL)
            -- without referencing a phantom ID or violating referential integrity.
            v_customer_id := NULL;
        ELSE
            -- Check if an unlinked historical guest record exists for this email
            SELECT id INTO v_customer_id
            FROM public.customers
            WHERE pg_catalog.lower(email) = v_customer_email
              AND auth_user_id IS NULL
            LIMIT 1;

            IF v_customer_id IS NOT NULL THEN
                -- ============================================================
                -- SCENARIO C.3: Existing guest customer record
                -- ============================================================
                -- Reuse existing guest record, update contact info if provided
                UPDATE public.customers
                SET name = coalesce(nullif(v_customer_name, ''), name),
                    phone = coalesce(nullif(v_customer_phone, ''), phone),
                    updated_at = pg_catalog.now()
                WHERE id = v_customer_id;
            ELSE
                -- ============================================================
                -- SCENARIO C.1: Completely new email
                -- ============================================================
                -- Provision a dedicated guest customer record so orders.customer_id
                -- references a valid row in public.customers
                v_customer_id := 'cust-' || pg_catalog.lower(pg_catalog.substr(pg_catalog.md5(v_customer_email || pg_catalog.clock_timestamp()::text), 1, 12));

                INSERT INTO public.customers (
                    id,
                    auth_user_id,
                    name,
                    email,
                    phone,
                    addresses,
                    total_orders,
                    total_spent,
                    created_at,
                    updated_at
                ) VALUES (
                    v_customer_id,
                    NULL,
                    v_customer_name,
                    v_customer_email,
                    v_customer_phone,
                    '[]'::jsonb,
                    0,
                    0.00,
                    pg_catalog.now(),
                    pg_catalog.now()
                );
            END IF;
        END IF;
    END IF;

    -- Update payload customer_info with authoritative email
    v_customer_info := v_customer_info || pg_catalog.jsonb_build_object('email', v_customer_email);

    -- 6. Extract Payment Method & Coupon Code
    v_payment_method := pg_catalog.lower(pg_catalog.btrim(coalesce(payload->>'paymentMethod', 'cod')));
    IF v_payment_method NOT IN ('upi', 'card', 'netbanking', 'cod') THEN
        RAISE EXCEPTION 'Invalid payment method "%". Allowed methods: upi, card, netbanking, cod', v_payment_method;
    END IF;

    v_coupon_code := nullif(pg_catalog.upper(pg_catalog.btrim(coalesce(payload->>'couponCode', ''))), '');

    -- 7. Validate Shipping Address
    v_shipping_address := payload->'shippingAddress';
    IF v_shipping_address IS NULL OR pg_catalog.jsonb_typeof(v_shipping_address) <> 'object' THEN
        RAISE EXCEPTION 'Shipping delivery address is required and must be a valid JSON object';
    END IF;

    v_street := pg_catalog.btrim(coalesce(v_shipping_address->>'street', ''));
    v_city := pg_catalog.btrim(coalesce(v_shipping_address->>'city', ''));
    v_state := pg_catalog.btrim(coalesce(v_shipping_address->>'state', ''));
    v_pincode := pg_catalog.btrim(coalesce(v_shipping_address->>'pincode', ''));
    v_country := coalesce(nullif(pg_catalog.btrim(coalesce(v_shipping_address->>'country', '')), ''), 'India');

    IF pg_catalog.char_length(v_street) < 3 OR pg_catalog.char_length(v_street) > 300 THEN
        RAISE EXCEPTION 'Valid delivery street address is required (3–300 characters)';
    END IF;

    IF pg_catalog.char_length(v_city) < 2 OR pg_catalog.char_length(v_city) > 100 THEN
        RAISE EXCEPTION 'Valid delivery city is required (2–100 characters)';
    END IF;

    IF pg_catalog.char_length(v_state) < 2 OR pg_catalog.char_length(v_state) > 100 THEN
        RAISE EXCEPTION 'Valid delivery state is required (2–100 characters)';
    END IF;

    IF v_pincode !~ '^[0-9]{6}$' THEN
        RAISE EXCEPTION 'Valid 6-digit postal code (PIN code) is required';
    END IF;

    -- 8. Validate Line Items Array Structure
    v_items := payload->'items';
    IF v_items IS NULL OR pg_catalog.jsonb_typeof(v_items) <> 'array' THEN
        RAISE EXCEPTION 'Payload "items" must be a non-empty JSON array';
    END IF;

    IF pg_catalog.jsonb_array_length(v_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one line item';
    END IF;

    IF pg_catalog.jsonb_array_length(v_items) > 25 THEN
        RAISE EXCEPTION 'Order exceeds maximum permitted distinct line items limit of 25';
    END IF;

    -- Validate individual line item entries
    FOR v_elem IN SELECT value FROM pg_catalog.jsonb_array_elements(v_items)
    LOOP
        IF pg_catalog.jsonb_typeof(v_elem) <> 'object' THEN
            RAISE EXCEPTION 'Malformed line item: each item entry must be a JSON object';
        END IF;

        v_item_raw_prod_id := nullif(pg_catalog.btrim(coalesce(v_elem->>'productId', v_elem->>'id', '')), '');
        IF v_item_raw_prod_id IS NULL THEN
            RAISE EXCEPTION 'Malformed line item: item is missing required "productId"';
        END IF;

        v_item_raw_qty_str := pg_catalog.btrim(coalesce(v_elem->>'quantity', ''));
        IF v_item_raw_qty_str IS NULL OR v_item_raw_qty_str = '' THEN
            RAISE EXCEPTION 'Malformed line item for product "%": missing required "quantity"', v_item_raw_prod_id;
        END IF;

        IF v_item_raw_qty_str !~ '^[1-9][0-9]*$' THEN
            RAISE EXCEPTION 'Invalid quantity "%" for product "%": quantity must be a positive whole integer', v_item_raw_qty_str, v_item_raw_prod_id;
        END IF;

        v_item_raw_qty := v_item_raw_qty_str::integer;
        IF v_item_raw_qty > 10 THEN
            RAISE EXCEPTION 'Quantity of % exceeds maximum permitted purchase limit of 10 units per item for product "%"', v_item_raw_qty, v_item_raw_prod_id;
        END IF;
    END LOOP;

    -- 9. Idempotency Cache Check (Returns cached response if duplicate submission)
    v_request_hash := pg_catalog.md5(
        v_customer_email || '|' ||
        v_payment_method || '|' ||
        coalesce(v_coupon_code, '') || '|' ||
        v_items::text || '|' ||
        v_shipping_address::text
    );

    SELECT * INTO v_idem_rec
    FROM public.checkout_idempotency_records
    WHERE key = v_idempotency_key
    FOR UPDATE;

    IF FOUND THEN
        IF v_idem_rec.status = 'completed' AND v_idem_rec.response_payload IS NOT NULL THEN
            IF v_idem_rec.request_hash = v_request_hash THEN
                RETURN v_idem_rec.response_payload || pg_catalog.jsonb_build_object('alreadyExists', true);
            ELSE
                RAISE EXCEPTION 'Idempotency conflict: Key "%" was previously used with different order parameters', v_idempotency_key;
            END IF;
        ELSIF v_idem_rec.status = 'processing' THEN
            RAISE EXCEPTION 'Order is currently processing under idempotency key "%". Please wait.', v_idempotency_key;
        END IF;
    ELSE
        INSERT INTO public.checkout_idempotency_records (
            key, customer_email, request_hash, status, created_at, updated_at
        ) VALUES (
            v_idempotency_key, v_customer_email, v_request_hash, 'processing', pg_catalog.now(), pg_catalog.now()
        );
    END IF;

    -- 10. Velocity / Frequency Rate Limiting (Maximum 5 orders per 10 minutes)
    SELECT pg_catalog.count(*) INTO v_recent_orders_count
    FROM public.orders
    WHERE (
        (v_order_auth_user_id IS NOT NULL AND auth_user_id = v_order_auth_user_id)
        OR pg_catalog.lower(customer_info->>'email') = v_customer_email
    )
    AND created_at > (pg_catalog.now() - interval '10 minutes');

    IF v_recent_orders_count >= 5 THEN
        RAISE EXCEPTION 'Order submission frequency limit exceeded (maximum 5 orders per 10 minutes). Please wait before placing another order.';
    END IF;

    -- 11. Process Aggregated Line Items with Authoritative Server Pricing & Stock Deduction
    FOR v_item_rec IN
        SELECT
            nullif(pg_catalog.btrim(coalesce(elem->>'productId', elem->>'id', '')), '') AS product_id,
            nullif(pg_catalog.btrim(coalesce(elem->>'variantId', elem->>'sku', '')), '') AS variant_id,
            pg_catalog.btrim(coalesce(elem->>'size', 'Standard')) AS orig_size,
            pg_catalog.btrim(coalesce(elem->>'color', 'Standard')) AS orig_color,
            pg_catalog.sum((elem->>'quantity')::integer)::integer AS total_quantity
        FROM pg_catalog.jsonb_array_elements(v_items) AS elem
        GROUP BY 1, 2, 3, 4
        ORDER BY 1 ASC, 2 ASC, 3 ASC
    LOOP
        -- Enforce aggregated quantity limit (maximum 10 units per consolidated line item)
        IF v_item_rec.total_quantity > 10 THEN
            RAISE EXCEPTION 'Aggregated quantity of % exceeds maximum permitted purchase limit of 10 units per item for product "%"',
                v_item_rec.total_quantity, v_item_rec.product_id;
        END IF;

        -- Lock parent product catalog record
        SELECT * INTO v_prod
        FROM public.products
        WHERE id = v_item_rec.product_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product with ID "%" does not exist in store catalog', v_item_rec.product_id;
        END IF;

        IF v_prod.status <> 'active' THEN
            RAISE EXCEPTION 'Product "%" is not currently active for purchase', v_prod.name;
        END IF;

        SELECT pg_catalog.count(*) INTO v_matching_variants_count
        FROM public.product_variants
        WHERE product_id = v_prod.id;

        v_has_variants := (v_matching_variants_count > 0);

        IF v_has_variants THEN
            -- Resolve variant by explicit ID or normalized color/size
            IF v_item_rec.variant_id IS NOT NULL THEN
                SELECT * INTO v_variant
                FROM public.product_variants
                WHERE id = v_item_rec.variant_id AND product_id = v_prod.id
                FOR UPDATE;
            END IF;

            IF v_variant.id IS NULL THEN
                SELECT * INTO v_variant
                FROM public.product_variants
                WHERE product_id = v_prod.id
                  AND pg_catalog.lower(size) = pg_catalog.lower(v_item_rec.orig_size)
                  AND (
                      pg_catalog.lower(color_name) = pg_catalog.lower(v_item_rec.orig_color)
                      OR pg_catalog.lower(v_item_rec.orig_color) = 'standard'
                  )
                ORDER BY id ASC
                LIMIT 1
                FOR UPDATE;
            END IF;

            IF v_variant.id IS NULL THEN
                RAISE EXCEPTION 'No matching variant found for product "%" with Size "%" and Color "%"',
                    v_prod.name, v_item_rec.orig_size, v_item_rec.orig_color;
            END IF;

            IF v_variant.stock < v_item_rec.total_quantity THEN
                RAISE EXCEPTION 'Insufficient stock for "%" (% / %): requested %, available %',
                    v_prod.name, v_variant.color_name, v_variant.size, v_item_rec.total_quantity, v_variant.stock;
            END IF;

            IF v_prod.total_stock < v_item_rec.total_quantity THEN
                RAISE EXCEPTION 'Aggregate inventory discrepancy for product "%": requested %, aggregate stock %',
                    v_prod.name, v_item_rec.total_quantity, v_prod.total_stock;
            END IF;

            v_unit_price := coalesce(v_variant.price, v_prod.price);
            IF v_unit_price < 0 THEN
                RAISE EXCEPTION 'Invalid price configured for variant "%"', v_variant.sku;
            END IF;

            -- Atomic variant stock deduction
            UPDATE public.product_variants
            SET stock = stock - v_item_rec.total_quantity,
                in_stock = ((stock - v_item_rec.total_quantity) > 0)
            WHERE id = v_variant.id;

            -- Synchronize parent product total_stock
            UPDATE public.products
            SET total_stock = greatest(0, total_stock - v_item_rec.total_quantity)
            WHERE id = v_prod.id;

            -- Log inventory deduction
            INSERT INTO public.inventory_logs (
                id, product_id, product_name, sku, variant_id, variant_label,
                previous_quantity, new_quantity, change, reason, note, admin_name, created_at
            ) VALUES (
                pg_catalog.gen_random_uuid(),
                v_prod.id,
                v_prod.name,
                coalesce(v_variant.sku, v_prod.sku),
                v_variant.id,
                v_variant.color_name || ' / ' || v_variant.size,
                v_variant.stock,
                v_variant.stock - v_item_rec.total_quantity,
                -v_item_rec.total_quantity,
                'order_fulfillment',
                'Checkout order placed',
                'Storefront Checkout',
                pg_catalog.now()
            );

            v_item_id := 'item-' || pg_catalog.lower(pg_catalog.substr(pg_catalog.md5(pg_catalog.random()::text || pg_catalog.clock_timestamp()::text), 1, 12));
            v_validated_items := v_validated_items || pg_catalog.jsonb_build_object(
                'id', v_item_id,
                'productId', v_prod.id,
                'name', v_prod.name,
                'price', v_unit_price,
                'quantity', v_item_rec.total_quantity,
                'size', v_variant.size,
                'color', v_variant.color_name,
                'image', v_prod.image,
                'sku', coalesce(v_variant.sku, v_prod.sku)
            );
        ELSE
            -- Non-variant product
            IF v_prod.total_stock < v_item_rec.total_quantity THEN
                RAISE EXCEPTION 'Insufficient stock for "%": requested %, available %',
                    v_prod.name, v_item_rec.total_quantity, v_prod.total_stock;
            END IF;

            v_unit_price := v_prod.price;
            IF v_unit_price < 0 THEN
                RAISE EXCEPTION 'Invalid catalog price configured for product "%"', v_prod.name;
            END IF;

            UPDATE public.products
            SET total_stock = total_stock - v_item_rec.total_quantity
            WHERE id = v_prod.id;

            INSERT INTO public.inventory_logs (
                id, product_id, product_name, sku, variant_id, variant_label,
                previous_quantity, new_quantity, change, reason, note, admin_name, created_at
            ) VALUES (
                pg_catalog.gen_random_uuid(),
                v_prod.id,
                v_prod.name,
                v_prod.sku,
                NULL,
                'Standard',
                v_prod.total_stock,
                v_prod.total_stock - v_item_rec.total_quantity,
                -v_item_rec.total_quantity,
                'order_fulfillment',
                'Checkout order placed',
                'Storefront Checkout',
                pg_catalog.now()
            );

            v_item_id := 'item-' || pg_catalog.lower(pg_catalog.substr(pg_catalog.md5(pg_catalog.random()::text || pg_catalog.clock_timestamp()::text), 1, 12));
            v_validated_items := v_validated_items || pg_catalog.jsonb_build_object(
                'id', v_item_id,
                'productId', v_prod.id,
                'name', v_prod.name,
                'price', v_unit_price,
                'quantity', v_item_rec.total_quantity,
                'size', v_item_rec.orig_size,
                'color', v_item_rec.orig_color,
                'image', v_prod.image,
                'sku', v_prod.sku
            );
        END IF;

        v_subtotal := v_subtotal + (v_unit_price * v_item_rec.total_quantity);
    END LOOP;

    -- 12. Authoritative Coupon Validation
    IF v_coupon_code IS NOT NULL AND v_coupon_code <> '' THEN
        SELECT * INTO v_coupon
        FROM public.coupons
        WHERE pg_catalog.upper(code) = v_coupon_code
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Coupon code "%" is invalid', v_coupon_code;
        END IF;

        IF NOT v_coupon.is_active THEN
            RAISE EXCEPTION 'Coupon code "%" is currently deactivated', v_coupon_code;
        END IF;

        IF pg_catalog.now() < v_coupon.start_date THEN
            RAISE EXCEPTION 'Coupon code "%" is not yet active (starts: %)', v_coupon_code, v_coupon.start_date;
        END IF;

        IF pg_catalog.now() > v_coupon.end_date THEN
            RAISE EXCEPTION 'Coupon code "%" has expired (ended: %)', v_coupon_code, v_coupon.end_date;
        END IF;

        IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
            RAISE EXCEPTION 'Coupon code "%" has reached its maximum redemption limit', v_coupon_code;
        END IF;

        IF v_subtotal < coalesce(v_coupon.min_purchase_amount, 0) THEN
            RAISE EXCEPTION 'Coupon code "%" requires a minimum purchase amount of % (current subtotal: %)',
                v_coupon_code, v_coupon.min_purchase_amount, v_subtotal;
        END IF;

        IF v_coupon.per_customer_limit IS NOT NULL AND v_customer_email <> '' THEN
            SELECT pg_catalog.count(*) INTO v_customer_coupon_uses
            FROM public.orders
            WHERE pg_catalog.upper(coupon_code) = v_coupon_code
              AND (
                  (v_order_auth_user_id IS NOT NULL AND auth_user_id = v_order_auth_user_id)
                  OR pg_catalog.lower(customer_info->>'email') = v_customer_email
              )
              AND shipping_status <> 'cancelled';

            IF v_customer_coupon_uses >= v_coupon.per_customer_limit THEN
                RAISE EXCEPTION 'You have already used coupon "%" the maximum allowed times (% per customer)',
                    v_coupon_code, v_coupon.per_customer_limit;
            END IF;
        END IF;

        IF v_coupon.discount_type = 'percentage' THEN
            IF v_coupon.discount_value <= 0 OR v_coupon.discount_value > 100 THEN
                RAISE EXCEPTION 'Invalid coupon percentage discount value: %', v_coupon.discount_value;
            END IF;
            v_discount := pg_catalog.round((v_subtotal * v_coupon.discount_value) / 100.0, 2);
            IF v_coupon.max_discount_amount IS NOT NULL AND v_discount > v_coupon.max_discount_amount THEN
                v_discount := v_coupon.max_discount_amount;
            END IF;
        ELSIF v_coupon.discount_type = 'fixed' THEN
            IF v_coupon.discount_value <= 0 THEN
                RAISE EXCEPTION 'Invalid coupon fixed discount value: %', v_coupon.discount_value;
            END IF;
            v_discount := least(v_subtotal, v_coupon.discount_value);
        ELSE
            RAISE EXCEPTION 'Unsupported coupon discount type "%"', v_coupon.discount_type;
        END IF;

        UPDATE public.coupons
        SET usage_count = usage_count + 1
        WHERE id = v_coupon.id;
    END IF;

    -- 13. Authoritative Shipping Fee Calculation from store_settings
    SELECT
        coalesce((settings->>'freeShippingThreshold')::numeric, 1499.00),
        coalesce((settings->>'flatShippingFee')::numeric, (settings->>'standardShippingFee')::numeric, 99.00),
        coalesce((settings->>'taxGstRate')::numeric, 0.00)
    INTO v_free_shipping_threshold, v_flat_shipping_fee, v_tax_rate
    FROM public.store_settings
    WHERE id = 'default'
    LIMIT 1;

    IF NOT FOUND OR v_free_shipping_threshold IS NULL THEN
        v_free_shipping_threshold := 1499.00;
        v_flat_shipping_fee := 99.00;
        v_tax_rate := 0.00;
    END IF;

    IF (v_subtotal - v_discount) >= v_free_shipping_threshold THEN
        v_shipping_charge := 0.00;
    ELSE
        v_shipping_charge := coalesce(v_flat_shipping_fee, 99.00);
    END IF;

    v_tax := 0.00;
    v_total := pg_catalog.round(greatest(0.00, (v_subtotal - v_discount) + v_shipping_charge + v_tax), 2);

    -- 14. Update Customer Spending Metrics (only if associated with a valid customer record)
    IF v_customer_id IS NOT NULL THEN
        UPDATE public.customers
        SET total_orders = total_orders + 1,
            total_spent = total_spent + v_total,
            last_order_date = pg_catalog.now()
        WHERE id = v_customer_id;
    END IF;

    -- 15. Strong UUID Order ID Generation
    v_order_id := 'ord_' || pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', '');

    -- 16. Collision-Safe Order Number Generation Loop
    v_order_number_attempt := 0;
    LOOP
        v_order_number_attempt := v_order_number_attempt + 1;
        IF v_order_number_attempt > 10 THEN
            RAISE EXCEPTION 'Failed to generate unique order reference number after 10 attempts';
        END IF;

        v_order_number := 'FF-' || pg_catalog.to_char(pg_catalog.now() AT TIME ZONE 'UTC', 'YYMMDD') || '-' || pg_catalog.lpad(pg_catalog.floor(pg_catalog.random() * 900000 + 100000)::text, 6, '0');

        BEGIN
            INSERT INTO public.orders (
                id,
                order_number,
                idempotency_key,
                customer_id,
                auth_user_id,
                customer_info,
                shipping_address,
                subtotal,
                discount,
                coupon_code,
                shipping_charge,
                tax,
                total,
                payment_method,
                payment_status,
                fulfillment_status,
                shipping_status,
                timeline,
                created_at,
                updated_at
            ) VALUES (
                v_order_id,
                v_order_number,
                v_idempotency_key,
                v_customer_id,
                v_order_auth_user_id,
                v_customer_info,
                v_shipping_address,
                v_subtotal,
                v_discount,
                v_coupon_code,
                v_shipping_charge,
                v_tax,
                v_total,
                v_payment_method,
                'pending',
                'unfulfilled',
                'pending',
                pg_catalog.jsonb_build_array(
                    pg_catalog.jsonb_build_object(
                        'status', 'pending',
                        'label', 'Order Placed',
                        'description', 'Customer confirmed checkout order on storefront',
                        'timestamp', pg_catalog.to_char(pg_catalog.now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                        'performedBy', CASE WHEN v_order_auth_user_id IS NOT NULL THEN 'Authenticated Customer' ELSE 'Guest Customer' END
                    )
                ),
                pg_catalog.now(),
                pg_catalog.now()
            );

            EXIT;
        EXCEPTION WHEN unique_violation THEN
            GET STACKED DIAGNOSTICS v_err_constraint = CONSTRAINT_NAME;
            IF v_err_constraint IN ('orders_order_number_key', 'uq_orders_order_number') THEN
                CONTINUE;
            ELSE
                RAISE;
            END IF;
        END;
    END LOOP;

    -- 17. Insert Validated Order Items
    FOR v_item_rec IN SELECT * FROM pg_catalog.jsonb_array_elements(v_validated_items) AS elem
    LOOP
        INSERT INTO public.order_items (
            id,
            order_id,
            product_id,
            name,
            price,
            quantity,
            size,
            color,
            image,
            sku
        ) VALUES (
            v_item_rec.value->>'id',
            v_order_id,
            v_item_rec.value->>'productId',
            v_item_rec.value->>'name',
            (v_item_rec.value->>'price')::numeric,
            (v_item_rec.value->>'quantity')::integer,
            v_item_rec.value->>'size',
            v_item_rec.value->>'color',
            v_item_rec.value->>'image',
            v_item_rec.value->>'sku'
        );
    END LOOP;

    -- 18. Store Completed Idempotency Record
    INSERT INTO public.checkout_idempotency_records (
        key,
        customer_email,
        request_hash,
        status,
        order_id,
        order_number,
        response_payload,
        created_at,
        updated_at
    ) VALUES (
        v_idempotency_key,
        v_customer_email,
        v_request_hash,
        'completed',
        v_order_id,
        v_order_number,
        pg_catalog.jsonb_build_object(
            'success', true,
            'orderId', v_order_id,
            'orderNumber', v_order_number,
            'subtotal', v_subtotal,
            'discount', v_discount,
            'shippingCharge', v_shipping_charge,
            'tax', v_tax,
            'total', v_total
        ),
        pg_catalog.now(),
        pg_catalog.now()
    );

    -- 19. Return Authoritative Order Confirmation Object
    RETURN pg_catalog.jsonb_build_object(
        'success', true,
        'orderId', v_order_id,
        'orderNumber', v_order_number,
        'subtotal', v_subtotal,
        'discount', v_discount,
        'shippingCharge', v_shipping_charge,
        'tax', v_tax,
        'total', v_total
    );
END;
$$;

-- Secure execution privileges
REVOKE EXECUTE ON FUNCTION public.create_customer_order(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_customer_order(jsonb) TO anon, authenticated, service_role;


-- ====================================================================
-- 9. SECURE ORDER CANCELLATION RPC (cancel_customer_order)
-- ====================================================================

CREATE OR REPLACE FUNCTION public.cancel_customer_order(p_order_id TEXT, p_reason TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_caller_id UUID;
    v_order RECORD;
    v_item RECORD;
    v_new_timeline JSONB;
    v_reason TEXT;
    v_prod RECORD;
    v_variant RECORD;
    v_variant_count INT;
BEGIN
    -- 1. Enforce Authentication (Anonymous callers cannot cancel orders)
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Authentication required to cancel orders'
            USING ERRCODE = '42501';
    END IF;

    v_reason := coalesce(nullif(pg_catalog.btrim(p_reason), ''), 'Customer cancellation request');

    -- 2. Fetch and Lock Order Record (Serializes concurrent cancellations)
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id OR order_number = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order with reference "%" could not be found', p_order_id
            USING ERRCODE = 'P0002';
    END IF;

    -- 3. Verify Ownership (Must be order owner or store admin)
    IF v_order.auth_user_id IS DISTINCT FROM v_caller_id AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: You do not have permission to cancel this order'
            USING ERRCODE = '42501';
    END IF;

    -- 4. Validate State Machine Allows Cancellation
    -- Once cancelled, any repeated attempt immediately raises an exception here,
    -- preventing duplicate stock restorations.
    IF v_order.shipping_status NOT IN ('pending', 'confirmed', 'processing', 'packed') THEN
        RAISE EXCEPTION 'Order #% cannot be cancelled because its current status is "%"',
            v_order.order_number, v_order.shipping_status
            USING ERRCODE = '22023';
    END IF;

    -- 5. Atomically Restore Inventory Stock
    FOR v_item IN
        SELECT oi.*
        FROM public.order_items oi
        WHERE oi.order_id = v_order.id
    LOOP
        -- Lock parent product
        SELECT * INTO v_prod
        FROM public.products
        WHERE id = v_item.product_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Cannot cancel order: product "%" (ID %) no longer exists in catalog',
                v_item.name, v_item.product_id;
        END IF;

        -- Check whether product maintains child variants
        SELECT pg_catalog.count(*) INTO v_variant_count
        FROM public.product_variants
        WHERE product_id = v_prod.id;

        IF v_variant_count > 0 THEN
            -- Product is variant-backed: find exact matching variant
            SELECT * INTO v_variant
            FROM public.product_variants
            WHERE product_id = v_prod.id
              AND (
                  sku = v_item.sku
                  OR (
                      pg_catalog.lower(size) = pg_catalog.lower(v_item.size)
                      AND pg_catalog.lower(color_name) = pg_catalog.lower(v_item.color)
                  )
              )
            ORDER BY (CASE WHEN sku = v_item.sku THEN 0 ELSE 1 END) ASC
            LIMIT 1
            FOR UPDATE;

            -- Never silently restore parent stock when an expected variant cannot be found
            IF v_variant.id IS NULL THEN
                RAISE EXCEPTION 'Cannot cancel order: required variant (SKU "%", Size "%", Color "%") for product "%" not found in inventory',
                    v_item.sku, v_item.size, v_item.color, v_prod.name;
            END IF;

            -- Atomic variant stock restoration
            UPDATE public.product_variants
            SET stock = stock + v_item.quantity,
                in_stock = true
            WHERE id = v_variant.id;

            -- Synchronize parent product total_stock
            UPDATE public.products
            SET total_stock = total_stock + v_item.quantity
            WHERE id = v_prod.id;

            -- Accurate inventory log reflection
            INSERT INTO public.inventory_logs (
                id, product_id, product_name, sku, variant_id, variant_label,
                previous_quantity, new_quantity, change, reason, note, admin_name, created_at
            ) VALUES (
                pg_catalog.gen_random_uuid(),
                v_prod.id,
                v_prod.name,
                coalesce(v_variant.sku, v_item.sku),
                v_variant.id,
                v_variant.color_name || ' / ' || v_variant.size,
                v_variant.stock,
                v_variant.stock + v_item.quantity,
                v_item.quantity,
                'customer_cancellation',
                'Order #' || v_order.order_number || ' cancelled: ' || v_reason,
                CASE WHEN public.is_admin() THEN 'Store Admin' ELSE 'Customer' END,
                pg_catalog.now()
            );
        ELSE
            -- Non-variant product stock restoration
            UPDATE public.products
            SET total_stock = total_stock + v_item.quantity
            WHERE id = v_prod.id;

            INSERT INTO public.inventory_logs (
                id, product_id, product_name, sku, variant_id, variant_label,
                previous_quantity, new_quantity, change, reason, note, admin_name, created_at
            ) VALUES (
                pg_catalog.gen_random_uuid(),
                v_prod.id,
                v_prod.name,
                coalesce(v_prod.sku, v_item.sku),
                NULL,
                'Standard',
                v_prod.total_stock,
                v_prod.total_stock + v_item.quantity,
                v_item.quantity,
                'customer_cancellation',
                'Order #' || v_order.order_number || ' cancelled: ' || v_reason,
                CASE WHEN public.is_admin() THEN 'Store Admin' ELSE 'Customer' END,
                pg_catalog.now()
            );
        END IF;
    END LOOP;

    -- 6. Build Timeline Event
    v_new_timeline := coalesce(v_order.timeline, '[]'::jsonb) || pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
            'status', 'cancelled',
            'label', 'Order Cancelled',
            'description', 'Order cancelled. Reason: ' || v_reason,
            'timestamp', pg_catalog.to_char(pg_catalog.now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
            'performedBy', CASE WHEN public.is_admin() THEN 'Store Admin' ELSE 'Customer' END
        )
    );

    -- 7. Transition Order State to Cancelled
    UPDATE public.orders
    SET shipping_status = 'cancelled',
        fulfillment_status = 'unfulfilled',
        timeline = v_new_timeline,
        updated_at = pg_catalog.now()
    WHERE id = v_order.id;

    -- 8. Return Confirmation
    RETURN pg_catalog.jsonb_build_object(
        'success', true,
        'orderId', v_order.id,
        'orderNumber', v_order.order_number,
        'shippingStatus', 'cancelled',
        'cancellationReason', v_reason
    );
END;
$$;

-- Secure execution privileges
REVOKE EXECUTE ON FUNCTION public.cancel_customer_order(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cancel_customer_order(text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.cancel_customer_order(text, text) TO authenticated, service_role;

COMMIT;
