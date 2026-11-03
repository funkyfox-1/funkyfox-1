-- ====================================================================
-- FUNKY FOX ECOMMERCE PLATFORM — STAGING ENVIRONMENT SEED FIXTURES
-- ====================================================================
-- Target: STAGING / LOCAL TEST ENVIRONMENTS ONLY
-- Security Notice: Contains purely synthetic test data. Zero production
--                  records, zero customer PII, zero real payment data.
-- ====================================================================

BEGIN;

-- --------------------------------------------------------------------
-- 1. SYNTHETIC CATEGORIES
-- --------------------------------------------------------------------
INSERT INTO public.categories (id, name, slug, description, image, is_visible, display_order)
VALUES
    ('cat_tees', 'Graphic Tees', 'graphic-tees', 'Heavyweight oversized streetwear graphic tees', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800', true, 1),
    ('cat_hoodies', 'Hoodies & Fleece', 'hoodies-fleece', 'Custom-milled premium cotton fleece hoodies', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800', true, 2),
    ('cat_bottoms', 'Cargo & Pants', 'cargo-pants', 'Relaxed utility cargo pants and denim', 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800', true, 3)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description;

-- --------------------------------------------------------------------
-- 2. SYNTHETIC PRODUCTS
-- --------------------------------------------------------------------
INSERT INTO public.products (
    id, slug, name, sku, short_description, description, details,
    price, original_price, cost_price, tax_rate, category_id, category,
    brand, tags, image, images, alt, status, is_new, is_bestseller,
    featured_order, total_stock, low_stock_threshold, allow_backorders
) VALUES
    (
        'prod_cyber_fox_tee',
        'cyber-fox-oversized-tee',
        'Cyber Fox Oversized Heavyweight Tee',
        'FF-TEE-CYBER-001',
        '240 GSM French Terry 100% Cotton Oversized Tee',
        'Engineered for premium street draping. Custom reactive garment dye with high-density silicone chest branding and screen-printed cyber fox graphic back art.',
        ARRAY['240 GSM 100% Combed Cotton', 'Ribbed Lycra Collar', 'Pre-shrunk Fabric', 'Machine Wash Cold'],
        999.00,
        1499.00,
        380.00,
        18.00,
        'cat_tees',
        'Graphic Tees',
        'Funky Fox',
        ARRAY['oversized', 'cyber', 'cotton', 'streetwear'],
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
        ARRAY['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'],
        'Cyber Fox Oversized Streetwear T-Shirt Front',
        'active',
        true,
        true,
        1,
        45,
        5,
        false
    ),
    (
        'prod_neon_shadow_hoodie',
        'neon-shadow-heavyweight-hoodie',
        'Neon Shadow Heavyweight Boxy Hoodie',
        'FF-HD-NEON-002',
        '420 GSM Diagonal Loop French Terry Street Hoodie',
        'Double-layered structured hood with dropped shoulders and relaxed kangaroo pocket. Finished with matte black metal aglets and subtle tonal embroidery.',
        ARRAY['420 GSM Heavyweight Terry', 'Double Layer Structured Hood', 'Seamless Cuffs', 'Dry Clean Recommended'],
        2499.00,
        3299.00,
        950.00,
        18.00,
        'cat_hoodies',
        'Hoodies & Fleece',
        'Funky Fox',
        ARRAY['heavyweight', 'hoodie', 'winter', 'black'],
        'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800',
        ARRAY['https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800'],
        'Neon Shadow Heavyweight Streetwear Hoodie',
        'active',
        true,
        false,
        2,
        30,
        5,
        false
    )
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    total_stock = EXCLUDED.total_stock,
    status = EXCLUDED.status;

-- --------------------------------------------------------------------
-- 3. SYNTHETIC PRODUCT VARIANTS
-- --------------------------------------------------------------------
INSERT INTO public.product_variants (
    id, product_id, size, color_name, color_hex, sku, stock, price, in_stock
) VALUES
    -- Variants for Cyber Fox Tee (Obsidian Black)
    ('var_cyber_tee_blk_s', 'prod_cyber_fox_tee', 'S', 'Obsidian Black', '#0A0A0A', 'FF-TEE-CYB-BLK-S', 10, 999.00, true),
    ('var_cyber_tee_blk_m', 'prod_cyber_fox_tee', 'M', 'Obsidian Black', '#0A0A0A', 'FF-TEE-CYB-BLK-M', 15, 999.00, true),
    ('var_cyber_tee_blk_l', 'prod_cyber_fox_tee', 'L', 'Obsidian Black', '#0A0A0A', 'FF-TEE-CYB-BLK-L', 12, 999.00, true),
    ('var_cyber_tee_blk_xl', 'prod_cyber_fox_tee', 'XL', 'Obsidian Black', '#0A0A0A', 'FF-TEE-CYB-BLK-XL', 8, 999.00, true),

    -- Variants for Neon Shadow Hoodie (Midnight Black)
    ('var_neon_hd_blk_m', 'prod_neon_shadow_hoodie', 'M', 'Midnight Black', '#111111', 'FF-HD-NEO-BLK-M', 12, 2499.00, true),
    ('var_neon_hd_blk_l', 'prod_neon_shadow_hoodie', 'L', 'Midnight Black', '#111111', 'FF-HD-NEO-BLK-L', 10, 2499.00, true),
    ('var_neon_hd_blk_xl', 'prod_neon_shadow_hoodie', 'XL', 'Midnight Black', '#111111', 'FF-HD-NEO-BLK-XL', 8, 2499.00, true)
ON CONFLICT (id) DO UPDATE SET
    stock = EXCLUDED.stock,
    price = EXCLUDED.price,
    in_stock = EXCLUDED.in_stock;

-- --------------------------------------------------------------------
-- 4. SYNTHETIC MARKETING BANNERS
-- --------------------------------------------------------------------
INSERT INTO public.banners (
    id, title, subtitle, image_url, mobile_image_url, cta_text, cta_link,
    badge, position, display_order, is_active
) VALUES (
    'ban_staging_hero_01',
    'STREETWEAR EVOLVED',
    'Autumn / Winter 2026 Collection Dropping Worldwide',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=1600',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800',
    'SHOP COLLECTION',
    '/shop',
    'NEW SEASON',
    'hero',
    1,
    true
) ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- 5. SYNTHETIC COUPONS (For Staging Verification)
-- --------------------------------------------------------------------
INSERT INTO public.coupons (
    id, code, description, discount_type, discount_value, min_purchase_amount,
    max_discount_amount, start_date, end_date, usage_limit, usage_count,
    per_customer_limit, is_active
) VALUES (
    'coup_stage_10',
    'STAGING10',
    'Staging 10% test discount code',
    'percentage',
    10.00,
    999.00,
    500.00,
    timezone('utc'::text, now()) - interval '1 day',
    timezone('utc'::text, now()) + interval '90 days',
    100,
    0,
    2,
    true
) ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ====================================================================
-- STAGING ADMINISTRATOR BOOTSTRAP INSTRUCTIONS:
-- ====================================================================
-- To test the Admin Portal in staging:
-- 1. Sign up a test user in Staging Supabase Auth (e.g. stage-admin@funkyfox.in).
-- 2. Execute the following in the Staging SQL Editor:
--
-- INSERT INTO public.admin_users (auth_user_id, email, name, role)
-- VALUES (
--     (SELECT id FROM auth.users WHERE email = 'stage-admin@funkyfox.in'),
--     'stage-admin@funkyfox.in',
--     'Staging Super Admin',
--     'super_admin'
-- ) ON CONFLICT (email) DO UPDATE SET role = 'super_admin';
-- ====================================================================
