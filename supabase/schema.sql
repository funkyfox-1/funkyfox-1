-- ====================================================================
-- FUNKY FOX ECOMMERCE & ADMIN PORTAL — COMPLETE SUPABASE PRODUCTION SCHEMA
-- ====================================================================

-- 1. ADMIN USERS & ROLES
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager')),
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMPTZ
);

-- Index for authentication lookup
CREATE INDEX IF NOT EXISTS idx_admin_users_auth_id ON public.admin_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    is_visible BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories(display_order);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    details TEXT[],
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2) CHECK (original_price >= price OR original_price IS NULL),
    cost_price NUMERIC(10, 2) CHECK (cost_price >= 0 OR cost_price IS NULL),
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    brand TEXT DEFAULT 'Funky Fox',
    tags TEXT[] DEFAULT '{}',
    image TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    alt TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
    is_new BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    featured_order INT DEFAULT 999,
    total_stock INT DEFAULT 0 CHECK (total_stock >= 0),
    low_stock_threshold INT DEFAULT 5,
    allow_backorders BOOLEAN DEFAULT false,
    seo_title TEXT,
    seo_description TEXT,
    seo_image TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 4. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS public.product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    price NUMERIC(10, 2),
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_variants_prod_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE UNIQUE INDEX IF NOT EXISTS uq_product_variants_prod_size_color
ON public.product_variants(product_id, (pg_catalog.lower(pg_catalog.btrim(size))), (pg_catalog.lower(pg_catalog.btrim(color_name))));

-- 5. INVENTORY LOGS (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    variant_id TEXT,
    variant_label TEXT,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    change INT NOT NULL,
    reason TEXT NOT NULL,
    note TEXT,
    admin_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_prod_id ON public.inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON public.inventory_logs(created_at DESC);

-- 6. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    addresses JSONB DEFAULT '[]'::jsonb,
    total_orders INT DEFAULT 0,
    total_spent NUMERIC(12, 2) DEFAULT 0.00,
    last_order_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- 7. ORDERS & ITEMS
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    idempotency_key TEXT,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_info JSONB NOT NULL,
    shipping_address JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    coupon_code TEXT,
    shipping_charge NUMERIC(10, 2) DEFAULT 0.00,
    tax NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    payment_details JSONB DEFAULT '{}'::jsonb,
    fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled',
    shipping_status TEXT NOT NULL DEFAULT 'pending' CHECK (shipping_status IN ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned')),
    shipment_details JSONB DEFAULT '{}'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    internal_notes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key ON public.orders(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(shipping_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    image TEXT NOT NULL,
    sku TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 8. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_purchase_amount NUMERIC(10, 2) DEFAULT 0,
    max_discount_amount NUMERIC(10, 2),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    usage_limit INT DEFAULT 100,
    usage_count INT DEFAULT 0,
    per_customer_limit INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- 9. HOMEPAGE & WEBSITE CONTENT (BANNERS)
CREATE TABLE IF NOT EXISTS public.banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    cta_text TEXT NOT NULL,
    cta_link TEXT NOT NULL,
    badge TEXT,
    position TEXT NOT NULL CHECK (position IN ('hero', 'middle', 'strip')),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. MEDIA LIBRARY
CREATE TABLE IF NOT EXISTS public.media_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    dimensions JSONB,
    used_in TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_name TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(created_at DESC);

-- 12. STORE SETTINGS
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & HELPER FUNCTIONS
-- ====================================================================

-- Function to safely verify admin membership without recursive RLS (Hardened search_path)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE auth_user_id = auth.uid()
    );
END;
$$;

-- Function to safely verify super admin membership (Hardened search_path)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE auth_user_id = auth.uid() AND role = 'super_admin'
    );
END;
$$;

-- 13. DEDICATED CHECKOUT IDEMPOTENCY RECORDS
CREATE TABLE IF NOT EXISTS public.checkout_idempotency_records (
    key TEXT PRIMARY KEY,
    customer_email TEXT NOT NULL,
    request_hash TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('processing', 'completed')),
    order_id TEXT,
    order_number TEXT,
    response_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_checkout_idempotency_email ON public.checkout_idempotency_records(customer_email);

-- Function to validate order status lifecycle transitions
CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- If shipping_status is not being updated, allow the operation (e.g. updating notes, tracking)
    IF OLD.shipping_status IS NOT DISTINCT FROM NEW.shipping_status THEN
        RETURN NEW;
    END IF;

    -- Valid Order Lifecycle State Machine (strictly aligned with OrderDetail.tsx):
    -- pending          -> confirmed, cancelled
    -- confirmed        -> processing, cancelled
    -- processing       -> packed, cancelled
    -- packed           -> shipped, cancelled
    -- shipped          -> out_for_delivery, delivered, returned
    -- out_for_delivery -> delivered, returned
    -- delivered        -> returned
    -- cancelled        -> none (terminal)
    -- returned         -> none (terminal)
    IF OLD.shipping_status = 'pending' AND NEW.shipping_status IN ('confirmed', 'cancelled') THEN
        RETURN NEW;
    ELSIF OLD.shipping_status = 'confirmed' AND NEW.shipping_status IN ('processing', 'cancelled') THEN
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

DROP TRIGGER IF EXISTS trg_validate_order_status ON public.orders;
CREATE TRIGGER trg_validate_order_status
BEFORE UPDATE OF shipping_status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_status_transition();

-- Secure Customer Order Creation RPC (Hardened SECURITY DEFINER with fixed search_path)
CREATE OR REPLACE FUNCTION public.create_customer_order(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_idempotency_key TEXT;
    v_request_hash TEXT;
    v_idem_rec RECORD;

    v_order_id TEXT;
    v_order_number TEXT;
    v_order_number_attempt INT;
    v_err_constraint TEXT;

    v_customer_info JSONB;
    v_shipping_address JSONB;
    v_items JSONB;
    v_customer_id TEXT;
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

    v_coupon RECORD;
    v_subtotal NUMERIC(12, 2) := 0.00;
    v_discount NUMERIC(12, 2) := 0.00;
    v_shipping_charge NUMERIC(12, 2) := 0.00;
    v_tax NUMERIC(12, 2) := 0.00;
    v_total NUMERIC(12, 2) := 0.00;

    v_free_shipping_threshold NUMERIC(10, 2) := 1499.00;
    v_flat_shipping_fee NUMERIC(10, 2) := 99.00;
    v_tax_rate NUMERIC(5, 2) := 0.00;

    v_recent_orders_count INT;
    v_customer_coupon_uses INT;
BEGIN
    v_idempotency_key := nullif(pg_catalog.btrim(coalesce(payload->>'idempotencyKey', '')), '');
    IF v_idempotency_key IS NULL OR pg_catalog.char_length(v_idempotency_key) < 16 OR pg_catalog.char_length(v_idempotency_key) > 128 THEN
        RAISE EXCEPTION 'A valid, non-empty idempotency key is required (16–128 characters)';
    END IF;

    IF v_idempotency_key !~ '^[A-Za-z0-9_\-]+$' THEN
        RAISE EXCEPTION 'Idempotency key contains invalid characters (allowed: alphanumeric, hyphen, underscore)';
    END IF;

    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('checkout_idempotency:' || v_idempotency_key));

    v_customer_info := payload->'customer';
    IF v_customer_info IS NULL OR pg_catalog.jsonb_typeof(v_customer_info) <> 'object' THEN
        RAISE EXCEPTION 'Customer information is required and must be a valid JSON object';
    END IF;

    v_customer_email := pg_catalog.lower(pg_catalog.btrim(coalesce(v_customer_info->>'email', '')));
    v_customer_name := pg_catalog.btrim(coalesce(v_customer_info->>'name', ''));
    v_customer_phone := pg_catalog.btrim(coalesce(v_customer_info->>'phone', ''));

    IF v_customer_email = '' OR pg_catalog.char_length(v_customer_email) < 5 OR pg_catalog.char_length(v_customer_email) > 255 THEN
        RAISE EXCEPTION 'A valid customer email address is required (5–255 characters)';
    END IF;

    IF v_customer_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' THEN
        RAISE EXCEPTION 'Invalid customer email address format: "%"', v_customer_email;
    END IF;

    IF v_customer_name = '' OR pg_catalog.char_length(v_customer_name) < 2 OR pg_catalog.char_length(v_customer_name) > 150 THEN
        RAISE EXCEPTION 'Customer full name is required (2–150 characters)';
    END IF;

    v_phone_digits := pg_catalog.regexp_replace(v_customer_phone, '[^0-9]', '', 'g');
    IF pg_catalog.char_length(v_phone_digits) < 10 OR pg_catalog.char_length(v_phone_digits) > 15 THEN
        RAISE EXCEPTION 'Customer phone number must contain between 10 and 15 digits';
    END IF;

    v_payment_method := pg_catalog.lower(pg_catalog.btrim(coalesce(payload->>'paymentMethod', 'cod')));
    IF v_payment_method NOT IN ('upi', 'card', 'netbanking', 'cod') THEN
        RAISE EXCEPTION 'Invalid payment method "%". Allowed methods: upi, card, netbanking, cod', v_payment_method;
    END IF;

    v_coupon_code := nullif(pg_catalog.upper(pg_catalog.btrim(coalesce(payload->>'couponCode', ''))), '');

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

    v_request_hash := pg_catalog.encode(
        pg_catalog.sha256(
            pg_catalog.convert_to(
                v_customer_email || '|' ||
                v_street || '|' || v_city || '|' || v_state || '|' || v_pincode || '|' ||
                v_items::text || '|' ||
                coalesce(v_coupon_code, '') || '|' ||
                v_payment_method,
                'UTF8'
            )
        ),
        'hex'
    );

    SELECT * INTO v_idem_rec
    FROM public.checkout_idempotency_records
    WHERE key = v_idempotency_key
    FOR UPDATE;

    IF FOUND THEN
        IF pg_catalog.lower(v_idem_rec.customer_email) <> v_customer_email THEN
            RAISE EXCEPTION 'Idempotency conflict: caller identity does not match original order';
        END IF;

        IF v_idem_rec.request_hash <> v_request_hash THEN
            RAISE EXCEPTION 'Idempotency conflict: request payload does not match original checkout parameters for this key';
        END IF;

        IF v_idem_rec.status = 'completed' AND v_idem_rec.response_payload IS NOT NULL THEN
            RETURN v_idem_rec.response_payload || pg_catalog.jsonb_build_object('alreadyExists', true);
        ELSE
            RAISE EXCEPTION 'A checkout request with this idempotency key is currently in progress. Please wait.';
        END IF;
    END IF;

    SELECT pg_catalog.count(*) INTO v_recent_orders_count
    FROM public.orders
    WHERE pg_catalog.lower(customer_info->>'email') = v_customer_email
      AND created_at > (pg_catalog.now() - interval '10 minutes');

    IF v_recent_orders_count >= 5 THEN
        RAISE EXCEPTION 'Order submission frequency limit exceeded (maximum 5 orders per 10 minutes). Please wait.';
    END IF;

    FOR v_item_rec IN
        SELECT
            coalesce(elem->>'productId', elem->>'id') AS product_id,
            pg_catalog.lower(pg_catalog.btrim(coalesce(elem->>'size', 'Standard'))) AS norm_size,
            pg_catalog.lower(pg_catalog.btrim(coalesce(elem->>'color', 'Standard'))) AS norm_color,
            coalesce(elem->>'size', 'Standard') AS orig_size,
            coalesce(elem->>'color', 'Standard') AS orig_color,
            pg_catalog.sum((elem->>'quantity')::integer)::integer AS total_quantity
        FROM pg_catalog.jsonb_array_elements(v_items) AS elem
        GROUP BY 1, 2, 3, 4, 5
        ORDER BY 1 ASC, 2 ASC, 3 ASC
    LOOP
        SELECT * INTO v_prod
        FROM public.products
        WHERE id = v_item_rec.product_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product with ID "%" does not exist in catalog', v_item_rec.product_id;
        END IF;

        IF v_prod.status <> 'active' THEN
            RAISE EXCEPTION 'Product "%" is not active for sale (current status: %)', v_prod.name, v_prod.status;
        END IF;

        SELECT EXISTS (
            SELECT 1 FROM public.product_variants WHERE product_id = v_prod.id
        ) INTO v_has_variants;

        IF v_has_variants THEN
            SELECT pg_catalog.count(*) INTO v_matching_variants_count
            FROM public.product_variants
            WHERE product_id = v_prod.id
              AND pg_catalog.lower(pg_catalog.btrim(size)) = v_item_rec.norm_size
              AND pg_catalog.lower(pg_catalog.btrim(color_name)) = v_item_rec.norm_color;

            IF v_matching_variants_count = 0 THEN
                RAISE EXCEPTION 'Unavailable product combination: "%" in size "%" and color "%" does not exist',
                    v_prod.name, v_item_rec.orig_size, v_item_rec.orig_color;
            ELSIF v_matching_variants_count > 1 THEN
                RAISE EXCEPTION 'Catalog integrity error: multiple conflicting variants found for product "%" (size: %, color: %)',
                    v_prod.name, v_item_rec.orig_size, v_item_rec.orig_color;
            END IF;

            SELECT * INTO v_variant
            FROM public.product_variants
            WHERE product_id = v_prod.id
              AND pg_catalog.lower(pg_catalog.btrim(size)) = v_item_rec.norm_size
              AND pg_catalog.lower(pg_catalog.btrim(color_name)) = v_item_rec.norm_color
            FOR UPDATE;

            IF v_variant.stock < v_item_rec.total_quantity THEN
                RAISE EXCEPTION 'Insufficient stock for "%" (% / %): requested %, available %',
                    v_prod.name, v_variant.size, v_variant.color_name, v_item_rec.total_quantity, v_variant.stock;
            END IF;

            IF v_prod.total_stock < v_item_rec.total_quantity THEN
                RAISE EXCEPTION 'Aggregate inventory discrepancy for product "%": requested %, aggregate stock %',
                    v_prod.name, v_item_rec.total_quantity, v_prod.total_stock;
            END IF;

            v_unit_price := coalesce(v_variant.price, v_prod.price);
            IF v_unit_price < 0 THEN
                RAISE EXCEPTION 'Invalid catalog price configured for product "%"', v_prod.name;
            END IF;

            UPDATE public.product_variants
            SET stock = stock - v_item_rec.total_quantity,
                in_stock = ((stock - v_item_rec.total_quantity) > 0)
            WHERE id = v_variant.id;

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
              AND pg_catalog.lower(customer_info->>'email') = v_customer_email
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

    SELECT id INTO v_customer_id FROM public.customers WHERE pg_catalog.lower(email) = v_customer_email LIMIT 1;
    IF v_customer_id IS NULL THEN
        v_customer_id := 'cust-' || pg_catalog.lower(pg_catalog.substr(pg_catalog.md5(v_customer_email), 1, 10));
        INSERT INTO public.customers (id, name, email, phone, total_orders, total_spent, last_order_date, created_at)
        VALUES (v_customer_id, v_customer_name, v_customer_email, v_customer_phone, 1, v_total, pg_catalog.now(), pg_catalog.now())
        ON CONFLICT (id) DO UPDATE SET
            total_orders = public.customers.total_orders + 1,
            total_spent = public.customers.total_spent + v_total,
            last_order_date = pg_catalog.now();
    ELSE
        UPDATE public.customers SET
            total_orders = total_orders + 1,
            total_spent = total_spent + v_total,
            last_order_date = pg_catalog.now(),
            phone = coalesce(nullif(v_customer_phone, ''), phone)
        WHERE id = v_customer_id;
    END IF;

    v_order_id := 'ord_' || pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', '');

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
                        'performedBy', 'Storefront Customer'
                    )
                ),
                pg_catalog.now(),
                pg_catalog.now()
            );

            EXIT;
        EXCEPTION WHEN unique_violation THEN
            IF SQLERRM LIKE '%order_number%' THEN
                CONTINUE;
            ELSE
                RAISE;
            END IF;
        END;
    END LOOP;

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

REVOKE EXECUTE ON FUNCTION public.create_customer_order(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_customer_order(jsonb) TO anon, authenticated, service_role;

-- Enable RLS across all 13 tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- ADMIN USERS POLICIES (Idempotent)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view their own admin profile" ON public.admin_users;
CREATE POLICY "Admins can view their own admin profile" ON public.admin_users
    FOR SELECT USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins can manage admin_users" ON public.admin_users;
CREATE POLICY "Super admins can manage admin_users" ON public.admin_users
    FOR ALL USING (public.is_super_admin());

-- --------------------------------------------------------------------
-- PUBLIC STOREFRONT POLICIES (Strictly Restricted Read-Only Public Access)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products" ON public.products
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories
    FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Public read active banners" ON public.banners;
CREATE POLICY "Public read active banners" ON public.banners
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read variants of active products" ON public.product_variants;
CREATE POLICY "Public read variants of active products" ON public.product_variants
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.products WHERE id = product_variants.product_id AND status = 'active')
    );

-- Clean up any legacy public policies
DROP POLICY IF EXISTS "Public read active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Public read store settings" ON public.store_settings;
-- Public guest direct table inserts are disabled; customer orders are created exclusively via create_customer_order() RPC
DROP POLICY IF EXISTS "Public guest checkout insert order" ON public.orders;
DROP POLICY IF EXISTS "Public guest checkout insert order items" ON public.order_items;

-- --------------------------------------------------------------------
-- ADMIN MANAGEMENT POLICIES (Authenticated Admin Authorization Required)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin full access products" ON public.products;
CREATE POLICY "Admin full access products" ON public.products
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access variants" ON public.product_variants;
CREATE POLICY "Admin full access variants" ON public.product_variants
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access categories" ON public.categories;
CREATE POLICY "Admin full access categories" ON public.categories
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access orders" ON public.orders;
CREATE POLICY "Admin full access orders" ON public.orders
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access order items" ON public.order_items;
CREATE POLICY "Admin full access order items" ON public.order_items
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access customers" ON public.customers;
CREATE POLICY "Admin full access customers" ON public.customers
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access inventory logs" ON public.inventory_logs;
CREATE POLICY "Admin full access inventory logs" ON public.inventory_logs
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access coupons" ON public.coupons;
CREATE POLICY "Admin full access coupons" ON public.coupons
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access banners" ON public.banners;
CREATE POLICY "Admin full access banners" ON public.banners
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access media" ON public.media_items;
CREATE POLICY "Admin full access media" ON public.media_items
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access audit logs" ON public.audit_logs;
CREATE POLICY "Admin full access audit logs" ON public.audit_logs
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access settings" ON public.store_settings;
CREATE POLICY "Admin full access settings" ON public.store_settings
    FOR ALL USING (public.is_admin());

-- ====================================================================
-- STORAGE BUCKET & STORAGE RLS POLICIES
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;
CREATE POLICY "Admin upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND public.is_admin()
    );

DROP POLICY IF EXISTS "Admin update product images" ON storage.objects;
CREATE POLICY "Admin update product images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' AND public.is_admin()
    );

DROP POLICY IF EXISTS "Admin delete product images" ON storage.objects;
CREATE POLICY "Admin delete product images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' AND public.is_admin()
    );

-- ====================================================================
-- INITIAL SUPER ADMIN BOOTSTRAP INSTRUCTIONS (RUN IN SUPABASE SQL EDITOR)
-- ====================================================================
-- 1. Create your administrator account under Authentication -> Users.
-- 2. Execute the following statement with your created user's email:
--
-- INSERT INTO public.admin_users (auth_user_id, email, name, role)
-- VALUES (
--     (SELECT id FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL@funkyfox.in'),
--     'YOUR_ADMIN_EMAIL@funkyfox.in',
--     'Funky Fox Owner',
--     'super_admin'
-- ) ON CONFLICT (email) DO UPDATE SET role = 'super_admin';
