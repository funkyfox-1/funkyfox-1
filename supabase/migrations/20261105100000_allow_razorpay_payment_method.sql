-- ====================================================================
-- FUNKY FOX ECOMMERCE PLATFORM
-- Migration: 20261104120000_catalog_id_slug_resolution.sql
-- Description: Upgrade create_customer_order RPC to resolve products by
--              id OR slug, and handle flexible color matching.
-- ====================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.create_customer_order(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
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
    -- 1. Validate Non-Empty, Well-Formed Idempotency Key
    v_idempotency_key := nullif(pg_catalog.btrim(coalesce(payload->>'idempotencyKey', '')), '');
    IF v_idempotency_key IS NULL OR pg_catalog.char_length(v_idempotency_key) < 16 OR pg_catalog.char_length(v_idempotency_key) > 128 THEN
        RAISE EXCEPTION 'A valid, non-empty idempotency key is required (16–128 characters)';
    END IF;

    IF v_idempotency_key !~ '^[A-Za-z0-9_\-]+$' THEN
        RAISE EXCEPTION 'Idempotency key contains invalid characters (allowed: alphanumeric, hyphen, underscore)';
    END IF;

    -- 2. Transaction-Scoped Advisory Serialization Lock
    -- Blocks concurrent requests with the identical idempotency key until this transaction commits or rolls back
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('checkout_idempotency:' || v_idempotency_key));

    -- 3. Extract and Sanitize Core Customer Identity
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

    -- 4. Extract Payment Method & Coupon
    v_payment_method := pg_catalog.lower(pg_catalog.btrim(coalesce(payload->>'paymentMethod', 'cod')));
    IF v_payment_method NOT IN ('upi', 'card', 'netbanking', 'cod', 'razorpay') THEN
        RAISE EXCEPTION 'Invalid payment method "%". Allowed methods: upi, card, netbanking, cod, razorpay', v_payment_method;
    END IF;

    v_coupon_code := nullif(pg_catalog.upper(pg_catalog.btrim(coalesce(payload->>'couponCode', ''))), '');

    -- 5. Validate Shipping Address
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

    -- 6. Validate Line Items Array Structure
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

    -- 7. Reject Malformed, Missing, Negative, Fractional, or Out-of-Bounds Quantities Upfront
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

    -- 8. Compute Material Request Fingerprint (SHA-256)
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

    -- 9. Idempotency Lookup (Executed Before Rate Limiting to ensure zero penalty on legitimate retries)
    SELECT * INTO v_idem_rec
    FROM public.checkout_idempotency_records
    WHERE key = v_idempotency_key
    FOR UPDATE;

    IF FOUND THEN
        -- Verify caller identity: prevent unauthorized customer data disclosure
        IF pg_catalog.lower(v_idem_rec.customer_email) <> v_customer_email THEN
            RAISE EXCEPTION 'Idempotency conflict: caller identity does not match original order';
        END IF;

        -- Verify material request payload integrity
        IF v_idem_rec.request_hash <> v_request_hash THEN
            RAISE EXCEPTION 'Idempotency conflict: request payload does not match original checkout parameters for this key';
        END IF;

        -- Return previously completed order response without re-deducting stock
        IF v_idem_rec.status = 'completed' AND v_idem_rec.response_payload IS NOT NULL THEN
            RETURN v_idem_rec.response_payload || pg_catalog.jsonb_build_object('alreadyExists', true);
        ELSE
            RAISE EXCEPTION 'A checkout request with this idempotency key is currently in progress. Please wait.';
        END IF;
    END IF;

    -- 10. Database-Level Frequency Limiting (Applies strictly to new orders, not retries)
    SELECT pg_catalog.count(*) INTO v_recent_orders_count
    FROM public.orders
    WHERE pg_catalog.lower(customer_info->>'email') = v_customer_email
      AND created_at > (pg_catalog.now() - interval '10 minutes');

    IF v_recent_orders_count >= 5 THEN
        RAISE EXCEPTION 'Order submission frequency limit exceeded (maximum 5 orders per 10 minutes). Please wait.';
    END IF;

    -- 11. Consolidate Duplicate Line Items & Sort Deterministically (Deadlock Prevention)
    -- Grouping by normalized keys ensures casing differences cannot bypass quantity validation
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
        -- Lock parent product row (matches by id OR by slug, prioritizing exact id)
        SELECT * INTO v_prod
        FROM public.products
        WHERE id = v_item_rec.product_id OR slug = v_item_rec.product_id
        ORDER BY (id = v_item_rec.product_id) DESC
        LIMIT 1
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product with ID "%" does not exist in catalog', v_item_rec.product_id;
        END IF;

        IF v_prod.status <> 'active' THEN
            RAISE EXCEPTION 'Product "%" is not active for sale (current status: %)', v_prod.name, v_prod.status;
        END IF;

        -- Check if product maintains child variants
        SELECT EXISTS (
            SELECT 1 FROM public.product_variants WHERE product_id = v_prod.id
        ) INTO v_has_variants;

        IF v_has_variants THEN
            -- Check for duplicate variant row ambiguity
            SELECT pg_catalog.count(*) INTO v_matching_variants_count
            FROM public.product_variants
            WHERE product_id = v_prod.id
              AND pg_catalog.lower(pg_catalog.btrim(size)) = v_item_rec.norm_size
              AND pg_catalog.lower(pg_catalog.btrim(color_name)) = v_item_rec.norm_color;

            IF v_matching_variants_count = 0 THEN
                -- Check if client passed standard/default color for an unambiguous variant of this size
                IF v_item_rec.norm_color IN ('standard', 'default') THEN
                    SELECT pg_catalog.count(*) INTO v_matching_variants_count
                    FROM public.product_variants
                    WHERE product_id = v_prod.id
                      AND pg_catalog.lower(pg_catalog.btrim(size)) = v_item_rec.norm_size;

                    IF v_matching_variants_count = 1 THEN
                        SELECT * INTO v_variant
                        FROM public.product_variants
                        WHERE product_id = v_prod.id
                          AND pg_catalog.lower(pg_catalog.btrim(size)) = v_item_rec.norm_size
                        FOR UPDATE;
                    END IF;
                END IF;

                IF v_matching_variants_count = 0 THEN
                    RAISE EXCEPTION 'Unavailable product combination: "%" in size "%" and color "%" does not exist',
                        v_prod.name, v_item_rec.orig_size, v_item_rec.orig_color;
                ELSIF v_matching_variants_count > 1 THEN
                    RAISE EXCEPTION 'Catalog integrity error: multiple conflicting variants found for product "%" (size: %, color: %)',
                        v_prod.name, v_item_rec.orig_size, v_item_rec.orig_color;
                END IF;
            ELSE
                -- Lock the single exact variant
                SELECT * INTO v_variant
                FROM public.product_variants
                WHERE product_id = v_prod.id
                  AND pg_catalog.lower(pg_catalog.btrim(size)) = v_item_rec.norm_size
                  AND pg_catalog.lower(pg_catalog.btrim(color_name)) = v_item_rec.norm_color
                FOR UPDATE;
            END IF;

            -- Explicit stock verification (no silent clamping)
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

            -- Decrement variant stock
            UPDATE public.product_variants
            SET stock = stock - v_item_rec.total_quantity,
                in_stock = ((stock - v_item_rec.total_quantity) > 0)
            WHERE id = v_variant.id;

            -- Decrement product aggregate stock
            UPDATE public.products
            SET total_stock = total_stock - v_item_rec.total_quantity
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

            -- Record validated item using CANONICAL database attributes
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
            -- Genuinely non-variant product
            IF v_prod.total_stock < v_item_rec.total_quantity THEN
                RAISE EXCEPTION 'Insufficient stock for "%": requested %, available %',
                    v_prod.name, v_item_rec.total_quantity, v_prod.total_stock;
            END IF;

            v_unit_price := v_prod.price;
            IF v_unit_price < 0 THEN
                RAISE EXCEPTION 'Invalid catalog price configured for product "%"', v_prod.name;
            END IF;

            -- Decrement product stock
            UPDATE public.products
            SET total_stock = total_stock - v_item_rec.total_quantity
            WHERE id = v_prod.id;

            -- Log inventory deduction
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

        -- Accumulate server-verified subtotal
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

    -- Shipping applies on net merchandise total (subtotal minus discount)
    IF (v_subtotal - v_discount) >= v_free_shipping_threshold THEN
        v_shipping_charge := 0.00;
    ELSE
        v_shipping_charge := coalesce(v_flat_shipping_fee, 99.00);
    END IF;

    -- Tax calculation: 0.00 (Indian apparel retail prices are MRP tax-inclusive)
    v_tax := 0.00;
    v_total := pg_catalog.round(greatest(0.00, (v_subtotal - v_discount) + v_shipping_charge + v_tax), 2);

    -- 14. Customer Profile Upsert
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

            EXIT; -- Success: exit collision-retry loop
        EXCEPTION WHEN unique_violation THEN
            GET STACKED DIAGNOSTICS v_err_constraint = CONSTRAINT_NAME;
            IF v_err_constraint IN ('orders_order_number_key', 'uq_orders_order_number') THEN
                CONTINUE; -- Order number collided: retry with fresh random sequence
            ELSE
                RAISE; -- Non-order_number violation (e.g. idempotency key or PK): abort immediately
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

-- Ensure public cannot directly INSERT into orders or order_items, forcing checkout via RPC
DROP POLICY IF EXISTS "Public guest checkout insert order" ON public.orders;
DROP POLICY IF EXISTS "Public guest checkout insert items" ON public.order_items;
DROP POLICY IF EXISTS "Public guest checkout insert order items" ON public.order_items;

COMMIT;
