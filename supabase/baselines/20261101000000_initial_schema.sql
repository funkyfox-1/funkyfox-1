-- ====================================================================
-- FUNKY FOX ECOMMERCE PLATFORM
-- Migration: 20261101000000_initial_schema.sql (Baseline Application Schema)
-- Description: Complete initial application database structure, 13 core
--              tables, foreign keys, indexes, security helper functions,
--              Row-Level Security (RLS) policies, and storage bucket.
-- Safe for execution: Fully idempotent, wrapped in a single transaction.
-- Target: Supabase PostgreSQL (Fresh Staging / Empty Environment)
-- ====================================================================

BEGIN;

-- --------------------------------------------------------------------
-- 1. ADMIN USERS & ROLES
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_admin_users_auth_id ON public.admin_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- --------------------------------------------------------------------
-- 2. CATEGORIES
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 3. PRODUCTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    details TEXT[] DEFAULT '{}',
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

-- --------------------------------------------------------------------
-- 4. PRODUCT VARIANTS
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 5. INVENTORY LOGS (AUDIT TRAIL)
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 6. CUSTOMERS
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 7. ORDERS & ORDER ITEMS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
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
    shipping_status TEXT NOT NULL DEFAULT 'pending',
    shipment_details JSONB DEFAULT '{}'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    internal_notes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
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

-- --------------------------------------------------------------------
-- 8. COUPONS
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 9. BANNERS (HOMEPAGE & MARKETING)
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 10. MEDIA LIBRARY
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 11. AUDIT LOGS
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 12. STORE SETTINGS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default settings row if absent
INSERT INTO public.store_settings (id, settings, updated_at)
VALUES (
    'default',
    '{"freeShippingThreshold": 1499.00, "flatShippingFee": 99.00, "standardShippingFee": 99.00, "taxGstRate": 0.00}'::jsonb,
    timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS
-- ====================================================================

-- Function to safely verify admin membership without recursive RLS
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

-- Function to safely verify super admin membership
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

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

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

-- Admin Users Policies
DROP POLICY IF EXISTS "Admins can view their own admin profile" ON public.admin_users;
CREATE POLICY "Admins can view their own admin profile" ON public.admin_users
    FOR SELECT USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins can manage admin_users" ON public.admin_users;
CREATE POLICY "Super admins can manage admin_users" ON public.admin_users
    FOR ALL USING (public.is_super_admin());

-- Public Storefront Policies (Read-Only)
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

-- Admin Management Policies (Admin Access Required)
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
-- STORAGE BUCKET & STORAGE POLICIES
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

COMMIT;
