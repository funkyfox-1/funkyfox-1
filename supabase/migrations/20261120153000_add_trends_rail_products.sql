-- Migration: Add Trends Rail Products (French Terry Hoodie & Tailored Wool Overcoat)
-- Allows full purchasing, variant inventory tracking, and admin catalog management

INSERT INTO public.products (
    id, slug, name, sku, short_description, description, details,
    price, original_price, cost_price, tax_rate, category_id, category,
    brand, tags, image, images, alt, status, is_new, is_bestseller,
    featured_order, total_stock, low_stock_threshold, allow_backorders,
    seo_title, seo_description
) VALUES
    (
        'french-terry-hoodie',
        'french-terry-hoodie',
        'French Terry Hoodie · Washed Charcoal',
        'FF-0160-FRENCH-TERRY-HOODIE',
        'Substantial 380 GSM looped French terry pullover hoodie with structured double-layer hood and relaxed drape.',
        '380 GSM looped French terry pullover with structured double-layer hood, front kangaroo pocket with reinforced bartacks, and tonal cotton drawcords.',
        ARRAY['380 GSM Combed Cotton French Terry', 'Double-layer structured hood with tonal drawcords', 'Reinforced front kangaroo pocket', 'Ribbed side gussets and cuffs for shape retention'],
        1499.00,
        1999.00,
        675.00,
        18.00,
        'jackets',
        'Jackets',
        'Funky Fox',
        ARRAY['jackets', 'streetwear', 'bestseller', 'new-arrival', 'hoodie'],
        '/images/products/demo-french-terry-hoodie.jpg',
        ARRAY['/images/products/demo-french-terry-hoodie.jpg'],
        'French Terry Hoodie in Washed Charcoal',
        'active',
        true,
        true,
        15,
        150,
        5,
        false,
        'French Terry Hoodie · Washed Charcoal | Funky Fox Official',
        'Buy French Terry Hoodie online at Funky Fox. 380 GSM looped cotton terry, pre-shrunk with kangaroo pocket.'
    ),
    (
        'tailored-wool-overcoat',
        'tailored-wool-overcoat',
        'Tailored Wool Overcoat · Camel',
        'FF-0161-TAILORED-WOOL-OVERCOAT',
        'Structured single-breasted overcoat tailored from a warm Melton wool blend with clean notch lapels.',
        'Tailored single-breasted overcoat cut in structured Melton wool blend with notch lapels, horn buttons, and deep welt pockets.',
        ARRAY['70% Melton Wool, 30% Polyamide', 'Classic notch lapels with clean lapel roll', 'Natural horn button closures', 'Smooth viscose lining and deep welt hand pockets'],
        2999.00,
        3999.00,
        1350.00,
        18.00,
        'jackets',
        'Jackets',
        'Funky Fox',
        ARRAY['jackets', 'outerwear', 'tailoring', 'bestseller', 'coat'],
        '/images/products/demo-tailored-wool-overcoat.jpg',
        ARRAY['/images/products/demo-tailored-wool-overcoat.jpg'],
        'Tailored Wool Overcoat in Camel',
        'active',
        true,
        true,
        16,
        120,
        5,
        false,
        'Tailored Wool Overcoat · Camel | Funky Fox Official',
        'Buy Tailored Wool Overcoat online at Funky Fox. Melton wool blend with horn buttons and structured lapels.'
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    images = EXCLUDED.images,
    category_id = EXCLUDED.category_id,
    category = EXCLUDED.category,
    status = EXCLUDED.status;

-- Product Variants for French Terry Hoodie
INSERT INTO public.product_variants (id, product_id, size, color_name, color_hex, sku, stock, price, in_stock) VALUES
    ('french-terry-hoodie-washed-charcoal-s', 'french-terry-hoodie', 'S', 'Washed Charcoal', '#2E3032', 'FF-0160-HOOD-CHA-S', 10, 1499.00, true),
    ('french-terry-hoodie-washed-charcoal-m', 'french-terry-hoodie', 'M', 'Washed Charcoal', '#2E3032', 'FF-0160-HOOD-CHA-M', 10, 1499.00, true),
    ('french-terry-hoodie-washed-charcoal-l', 'french-terry-hoodie', 'L', 'Washed Charcoal', '#2E3032', 'FF-0160-HOOD-CHA-L', 10, 1499.00, true),
    ('french-terry-hoodie-washed-charcoal-xl', 'french-terry-hoodie', 'XL', 'Washed Charcoal', '#2E3032', 'FF-0160-HOOD-CHA-XL', 10, 1499.00, true),
    ('french-terry-hoodie-washed-charcoal-xxl', 'french-terry-hoodie', 'XXL', 'Washed Charcoal', '#2E3032', 'FF-0160-HOOD-CHA-XXL', 10, 1499.00, true),
    ('french-terry-hoodie-heather-grey-s', 'french-terry-hoodie', 'S', 'Heather Grey', '#9CA3AF', 'FF-0160-HOOD-GRE-S', 10, 1499.00, true),
    ('french-terry-hoodie-heather-grey-m', 'french-terry-hoodie', 'M', 'Heather Grey', '#9CA3AF', 'FF-0160-HOOD-GRE-M', 10, 1499.00, true),
    ('french-terry-hoodie-heather-grey-l', 'french-terry-hoodie', 'L', 'Heather Grey', '#9CA3AF', 'FF-0160-HOOD-GRE-L', 10, 1499.00, true),
    ('french-terry-hoodie-heather-grey-xl', 'french-terry-hoodie', 'XL', 'Heather Grey', '#9CA3AF', 'FF-0160-HOOD-GRE-XL', 10, 1499.00, true),
    ('french-terry-hoodie-heather-grey-xxl', 'french-terry-hoodie', 'XXL', 'Heather Grey', '#9CA3AF', 'FF-0160-HOOD-GRE-XXL', 10, 1499.00, true),
    ('french-terry-hoodie-vintage-black-s', 'french-terry-hoodie', 'S', 'Vintage Black', '#1A1A1A', 'FF-0160-HOOD-BLK-S', 10, 1499.00, true),
    ('french-terry-hoodie-vintage-black-m', 'french-terry-hoodie', 'M', 'Vintage Black', '#1A1A1A', 'FF-0160-HOOD-BLK-M', 10, 1499.00, true),
    ('french-terry-hoodie-vintage-black-l', 'french-terry-hoodie', 'L', 'Vintage Black', '#1A1A1A', 'FF-0160-HOOD-BLK-L', 10, 1499.00, true),
    ('french-terry-hoodie-vintage-black-xl', 'french-terry-hoodie', 'XL', 'Vintage Black', '#1A1A1A', 'FF-0160-HOOD-BLK-XL', 10, 1499.00, true),
    ('french-terry-hoodie-vintage-black-xxl', 'french-terry-hoodie', 'XXL', 'Vintage Black', '#1A1A1A', 'FF-0160-HOOD-BLK-XXL', 10, 1499.00, true)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    in_stock = EXCLUDED.in_stock;

-- Product Variants for Tailored Wool Overcoat
INSERT INTO public.product_variants (id, product_id, size, color_name, color_hex, sku, stock, price, in_stock) VALUES
    ('tailored-wool-overcoat-camel-m', 'tailored-wool-overcoat', 'M', 'Camel', '#A07D5A', 'FF-0161-COAT-CAM-M', 10, 2999.00, true),
    ('tailored-wool-overcoat-camel-l', 'tailored-wool-overcoat', 'L', 'Camel', '#A07D5A', 'FF-0161-COAT-CAM-L', 10, 2999.00, true),
    ('tailored-wool-overcoat-camel-xl', 'tailored-wool-overcoat', 'XL', 'Camel', '#A07D5A', 'FF-0161-COAT-CAM-XL', 10, 2999.00, true),
    ('tailored-wool-overcoat-camel-xxl', 'tailored-wool-overcoat', 'XXL', 'Camel', '#A07D5A', 'FF-0161-COAT-CAM-XXL', 10, 2999.00, true),
    ('tailored-wool-overcoat-dark-navy-m', 'tailored-wool-overcoat', 'M', 'Dark Navy', '#1B2636', 'FF-0161-COAT-NAV-M', 10, 2999.00, true),
    ('tailored-wool-overcoat-dark-navy-l', 'tailored-wool-overcoat', 'L', 'Dark Navy', '#1B2636', 'FF-0161-COAT-NAV-L', 10, 2999.00, true),
    ('tailored-wool-overcoat-dark-navy-xl', 'tailored-wool-overcoat', 'XL', 'Dark Navy', '#1B2636', 'FF-0161-COAT-NAV-XL', 10, 2999.00, true),
    ('tailored-wool-overcoat-dark-navy-xxl', 'tailored-wool-overcoat', 'XXL', 'Dark Navy', '#1B2636', 'FF-0161-COAT-NAV-XXL', 10, 2999.00, true),
    ('tailored-wool-overcoat-charcoal-melton-m', 'tailored-wool-overcoat', 'M', 'Charcoal Melton', '#36454F', 'FF-0161-COAT-CHA-M', 10, 2999.00, true),
    ('tailored-wool-overcoat-charcoal-melton-l', 'tailored-wool-overcoat', 'L', 'Charcoal Melton', '#36454F', 'FF-0161-COAT-CHA-L', 10, 2999.00, true),
    ('tailored-wool-overcoat-charcoal-melton-xl', 'tailored-wool-overcoat', 'XL', 'Charcoal Melton', '#36454F', 'FF-0161-COAT-CHA-XL', 10, 2999.00, true),
    ('tailored-wool-overcoat-charcoal-melton-xxl', 'tailored-wool-overcoat', 'XXL', 'Charcoal Melton', '#36454F', 'FF-0161-COAT-CHA-XXL', 10, 2999.00, true)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    in_stock = EXCLUDED.in_stock;
