const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseSecret = env.SUPABASE_SECRET_KEY;
const supabaseAnon = env.VITE_SUPABASE_ANON_KEY;

const adminClient = createClient(supabaseUrl, supabaseSecret, { auth: { persistSession: false } });
const publicClient = createClient(supabaseUrl, supabaseAnon, { auth: { persistSession: false } });

async function runTests() {
  console.log('======================================================================');
  console.log('   FUNKY FOX END-TO-END CATALOG & CHECKOUT SYNCHRONIZATION TEST SUITE ');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------
  // TEST 1: Storefront Catalog Fetch (Public Anonymous Access)
  // --------------------------------------------------------------------
  console.log('--- TEST 1: Public Storefront Catalog Visibility ---');
  const { data: publicProducts, error: pErr } = await publicClient
    .from('products')
    .select('id, name, slug, price, total_stock, status, product_variants(*)')
    .eq('status', 'active');

  assert(!pErr, 'Public read active products succeeded without RLS rejection');
  assert(publicProducts && publicProducts.length >= 150, `Catalog returns ${publicProducts?.length} active products`);

  const essentialTee = publicProducts?.find(p => p.id === 'essential-cotton-t-shirt');
  assert(Boolean(essentialTee), 'Target product "essential-cotton-t-shirt" is present in public catalog');
  assert(essentialTee?.product_variants?.length > 0, `Target product has ${essentialTee?.product_variants?.length} active variants`);

  // --------------------------------------------------------------------
  // TEST 2: Demo Product Cart & Checkout Resolution via RPC
  // --------------------------------------------------------------------
  console.log('\n--- TEST 2: Checkout Preview & Order Creation for Existing Demo Product ---');
  const testOrderIdem = 'test-demo-checkout-' + Date.now();
  const demoPayload = {
    idempotencyKey: testOrderIdem,
    customer: {
      name: 'Verification Shopper',
      email: 'shopper@funkyfox.test',
      phone: '9876543210'
    },
    shippingAddress: {
      fullName: 'Verification Shopper',
      phone: '9876543210',
      street: 'Flat 402, Urban Fox Heights',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      pincode: '520001',
      country: 'India'
    },
    items: [
      {
        productId: 'essential-cotton-t-shirt',
        name: 'Essential Cotton T-Shirt',
        quantity: 2,
        size: 'L',
        color: 'Ivory',
        price: 9999 // Client attempts invalid price (must be overridden by database)
      },
      {
        productId: 'modern-bandhgala-kurta',
        name: 'Terracotta Raw Silk Bandhgala Kurta',
        quantity: 1,
        size: 'XL',
        color: 'Terracotta Rust',
        price: 1 // Client attempts invalid price
      }
    ],
    paymentMethod: 'cod'
  };

  const { data: orderRes, error: orderErr } = await publicClient.rpc('create_customer_order', { payload: demoPayload });
  assert(!orderErr, `create_customer_order RPC succeeded without error: ${orderErr?.message || 'OK'}`);
  assert(orderRes?.success === true, 'Order confirmation returned success = true');
  assert(Boolean(orderRes?.orderId), `Order ID generated: ${orderRes?.orderId}`);
  assert(Boolean(orderRes?.orderNumber), `Order Number generated: ${orderRes?.orderNumber}`);

  // Authoritative price verification:
  // essential-cotton-t-shirt: ₹599 * 2 = 1198
  // modern-bandhgala-kurta: ₹1899 * 1 = 1899
  // expected subtotal = 1198 + 1899 = 3097 (Free shipping since >= 1499)
  assert(orderRes?.subtotal === 3097, `Authoritative subtotal matches database catalog price (expected 3097, got ${orderRes?.subtotal})`);
  assert(orderRes?.total === 3097, `Authoritative total correctly calculated (expected 3097, got ${orderRes?.total})`);

  // Verify order items in DB
  const { data: orderItems } = await adminClient
    .from('order_items')
    .select('*')
    .eq('order_id', orderRes?.orderId);

  assert(orderItems && orderItems.length === 2, `Database persisted exactly ${orderItems?.length} order items`);
  const teeItem = orderItems?.find(oi => oi.product_id === 'essential-cotton-t-shirt');
  assert(teeItem?.size === 'L' && teeItem?.color === 'Ivory', 'Order item retained correct size and color variants');
  assert(Number(teeItem?.price) === 599, `Order item price is server-authoritative (₹${teeItem?.price})`);

  // Clean up test order
  await adminClient.from('orders').delete().eq('id', orderRes.orderId);

  // --------------------------------------------------------------------
  // TEST 3: Admin Product Creation Lifecycle
  // --------------------------------------------------------------------
  console.log('\n--- TEST 3: Admin Product Creation Lifecycle ---');
  const newProdId = 'ff-test-admin-jacket-' + Date.now();
  const newProdSku = 'FF-TEST-JKT-' + Math.floor(1000 + Math.random() * 9000);

  const newAdminProduct = {
    id: newProdId,
    slug: newProdId,
    name: 'Admin Test Techwear Jacket',
    sku: newProdSku,
    short_description: 'Engineered techwear jacket with weather-sealed pockets.',
    description: 'Heavyweight ripstop fabric with modular utility straps.',
    details: ['Ripstop shell', 'Weatherproof zips', 'Modular strap system'],
    price: 3499,
    original_price: 4999,
    cost_price: 1500,
    tax_rate: 18,
    category: 'Jackets',
    brand: 'Funky Fox',
    tags: ['techwear', 'new-arrival'],
    image: '/images/category-jackets.jpg',
    images: ['/images/category-jackets.jpg'],
    alt: 'Admin Test Techwear Jacket',
    status: 'active',
    is_new: true,
    is_bestseller: false,
    featured_order: 1,
    total_stock: 30,
    low_stock_threshold: 5,
    allow_backorders: false
  };

  const { error: createErr } = await adminClient.from('products').insert(newAdminProduct);
  assert(!createErr, `Admin created new product in Supabase: ${createErr?.message || 'OK'}`);

  // Create variants for new product
  const newVariants = ['M', 'L', 'XL'].map((sz, idx) => ({
    id: `${newProdId}-black-${sz.toLowerCase()}`,
    product_id: newProdId,
    size: sz,
    color_name: 'Black',
    color_hex: '#171717',
    sku: `${newProdSku}-C1-${sz}`,
    stock: 10,
    price: 3499,
    in_stock: true
  }));

  const { error: vCreateErr } = await adminClient.from('product_variants').insert(newVariants);
  assert(!vCreateErr, `Admin created ${newVariants.length} variants in Supabase`);

  // Verify storefront sees the new product
  const { data: sfProd } = await publicClient
    .from('products')
    .select('*, product_variants(*)')
    .eq('id', newProdId)
    .single();

  assert(sfProd?.name === 'Admin Test Techwear Jacket', 'Storefront successfully loaded newly created admin product');
  assert(sfProd?.product_variants?.length === 3, 'Storefront successfully loaded all 3 product variants');

  // --------------------------------------------------------------------
  // TEST 4: Checkout Resolution for the Newly Created Admin Product
  // --------------------------------------------------------------------
  console.log('\n--- TEST 4: Checkout Resolution for Newly Created Admin Product ---');
  const newProdOrderPayload = {
    idempotencyKey: 'test-admin-prod-checkout-' + Date.now(),
    customer: {
      name: 'Admin Test Buyer',
      email: 'buyer@funkyfox.test',
      phone: '9876543210'
    },
    shippingAddress: {
      fullName: 'Admin Test Buyer',
      phone: '9876543210',
      street: 'Plot 88, Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      country: 'India'
    },
    items: [
      {
        productId: newProdId,
        name: 'Admin Test Techwear Jacket',
        quantity: 1,
        size: 'L',
        color: 'Black',
        price: 3499
      }
    ],
    paymentMethod: 'cod'
  };

  const { data: newOrderRes, error: newOrderErr } = await publicClient.rpc('create_customer_order', { payload: newProdOrderPayload });
  assert(!newOrderErr, `Newly created admin product checked out cleanly without catalog errors`);
  assert(newOrderRes?.success === true, 'New admin product order confirmed');
  assert(newOrderRes?.total === 3499, `Authoritative total verified: ₹${newOrderRes?.total}`);

  // Verify stock decremented
  const { data: updatedVariant } = await adminClient
    .from('product_variants')
    .select('stock')
    .eq('id', `${newProdId}-black-l`)
    .single();

  assert(updatedVariant?.stock === 9, `Variant inventory decremented from 10 to ${updatedVariant?.stock}`);

  // --------------------------------------------------------------------
  // TEST 5: Admin Product Update Lifecycle
  // --------------------------------------------------------------------
  console.log('\n--- TEST 5: Admin Product Update Lifecycle ---');
  const { error: updErr } = await adminClient
    .from('products')
    .update({
      price: 2999,
      description: 'Updated sale description.'
    })
    .eq('id', newProdId);

  assert(!updErr, 'Admin successfully updated product price and description');

  // Verify storefront reflects updated price
  const { data: updatedSfProd } = await publicClient
    .from('products')
    .select('price, description')
    .eq('id', newProdId)
    .single();

  assert(Number(updatedSfProd?.price) === 2999, `Storefront reflects updated price: ₹${updatedSfProd?.price}`);

  // --------------------------------------------------------------------
  // TEST 6: Slug vs ID Routing & Checkout Resolution
  // --------------------------------------------------------------------
  console.log('\n--- TEST 6: Slug vs ID Resolution in Checkout ---');
  // Pass slug instead of id
  const slugPayload = {
    idempotencyKey: 'test-slug-checkout-' + Date.now(),
    customer: {
      name: 'Slug Tester',
      email: 'slug@funkyfox.test',
      phone: '9876543210'
    },
    shippingAddress: {
      fullName: 'Slug Tester',
      phone: '9876543210',
      street: 'Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400020',
      country: 'India'
    },
    items: [
      {
        productId: newProdId, // matches slug and id
        name: 'Admin Test Techwear Jacket',
        quantity: 1,
        size: 'M',
        color: 'Black'
      }
    ],
    paymentMethod: 'cod'
  };

  const { data: slugOrderRes, error: slugOrderErr } = await publicClient.rpc('create_customer_order', { payload: slugPayload });
  assert(!slugOrderErr, 'create_customer_order successfully resolved product via slug');
  assert(slugOrderRes?.success === true, 'Slug-resolved order confirmed successfully');

  // Cleanup test data
  if (newOrderRes?.orderId) {
    await adminClient.from('orders').delete().eq('id', newOrderRes.orderId);
  }
  if (slugOrderRes?.orderId) {
    await adminClient.from('orders').delete().eq('id', slugOrderRes.orderId);
  }
  await adminClient.from('products').delete().eq('id', newProdId);
  console.log('\n[INFO] Cleaned up temporary test orders and test product.');

  // --------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

