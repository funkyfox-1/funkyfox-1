import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      envVars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function runRpcVerification() {
  console.log('=== VERIFYING CHECKOUT RPC (create_customer_order) ===\n');

  // Find a test product and variant
  const { data: prodData } = await supabase
    .from('products')
    .select('id, name, price, total_stock, product_variants(*)')
    .eq('id', 'modern-bandhgala-kurta')
    .single();

  if (!prodData || !prodData.product_variants || prodData.product_variants.length === 0) {
    console.error('Target product modern-bandhgala-kurta not found in DB');
    return;
  }

  const sampleVariant = prodData.product_variants[0];
  console.log(`Target Product: "${prodData.name}" (ID: ${prodData.id}, Price: ₹${prodData.price})`);
  console.log(`Target Variant: ${sampleVariant.color_name} / ${sampleVariant.size} (ID: ${sampleVariant.id}, Initial Stock: ${sampleVariant.stock})\n`);

  // TEST 2A: Insufficient Stock Rejection
  console.log('--- TEST 2A: Insufficient Stock Rejection (Request 999 units) ---');
  const excessivePayload = {
    idempotencyKey: `test-idem-stock-${Date.now()}-12345678`,
    customer: {
      name: 'Stock Overflow Tester',
      email: 'stock.test@funkyfox.test',
      phone: '9876543210'
    },
    shippingAddress: {
      fullName: 'Stock Overflow Tester',
      phone: '9876543210',
      street: '12 Test Road',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      country: 'India'
    },
    items: [
      {
        productId: prodData.id,
        name: prodData.name,
        quantity: 9999, // Exceeds stock
        size: sampleVariant.size,
        color: sampleVariant.color_name,
        price: prodData.price
      }
    ],
    paymentMethod: 'cod'
  };

  const { error: stockErr } = await supabase.rpc('create_customer_order', { payload: excessivePayload });
  if (stockErr) {
    console.log('  Result: REJECTED AS EXPECTED ✅');
    console.log('  Server Error Message:', stockErr.message);
  } else {
    console.error('  Result: FAILED! Order should have been rejected for excess quantity ❌');
  }

  // TEST 2B: Invalid Product ID Rejection
  console.log('\n--- TEST 2B: Invalid Product ID Rejection ---');
  const fakeProdPayload = {
    ...excessivePayload,
    idempotencyKey: `test-idem-fake-${Date.now()}-12345678`,
    items: [
      {
        productId: 'completely-fake-product-id',
        name: 'Fake Garment',
        quantity: 1,
        size: 'M',
        color: 'Black',
        price: 999
      }
    ]
  };
  const { error: fakeErr } = await supabase.rpc('create_customer_order', { payload: fakeProdPayload });
  if (fakeErr) {
    console.log('  Result: REJECTED AS EXPECTED ✅');
    console.log('  Server Error Message:', fakeErr.message);
  } else {
    console.error('  Result: FAILED! Fake product order should have been rejected ❌');
  }

  // TEST 2C: Server-Side Authoritative Price Verification
  console.log('\n--- TEST 2C: Server-Side Authoritative Price Check (Client submits ₹1 for ₹' + prodData.price + ' item) ---');
  const priceTamperPayload = {
    ...excessivePayload,
    idempotencyKey: `test-idem-price-${Date.now()}-12345678`,
    items: [
      {
        productId: prodData.id,
        name: prodData.name,
        quantity: 1,
        size: sampleVariant.size,
        color: sampleVariant.color_name,
        price: 1.00 // Tampered client price!
      }
    ]
  };

  const { data: priceResult, error: priceErr } = await supabase.rpc('create_customer_order', { payload: priceTamperPayload });
  if (priceErr) {
    console.log('  RPC Error:', priceErr.message);
  } else {
    console.log('  Order Created successfully.');
    console.log('  Server-calculated Subtotal: ₹' + priceResult.subtotal);
    console.log('  Server-calculated Total: ₹' + priceResult.total);
    if (Number(priceResult.subtotal) === Number(prodData.price)) {
      console.log('  Result: VERIFIED! Server ignored client price ₹1 and charged authoritative DB price ₹' + prodData.price + ' ✅');
    } else {
      console.error('  Result: VULNERABLE! Server accepted client price ₹' + priceResult.subtotal + ' ❌');
    }
  }

  // TEST 2D: Duplicate Idempotency Key Handling
  console.log('\n--- TEST 2D: Duplicate Idempotency Key Submission ---');
  if (priceResult) {
    const { data: dupResult, error: dupErr } = await supabase.rpc('create_customer_order', { payload: priceTamperPayload });
    if (dupErr) {
      console.log('  Duplicate Rejected:', dupErr.message);
    } else {
      console.log('  Duplicate Result alreadyExists:', dupResult.alreadyExists);
      console.log('  Returned Same Order Number:', dupResult.orderNumber === priceResult.orderNumber);
      if (dupResult.alreadyExists && dupResult.orderNumber === priceResult.orderNumber) {
        console.log('  Result: IDEMPOTENCY ENFORCED! Duplicate submission safely returned existing order without double-charging ✅');
      }
    }
  }

  // Check final stock of sample variant
  const { data: finalVariant } = await supabase
    .from('product_variants')
    .select('stock')
    .eq('id', sampleVariant.id)
    .single();

  console.log(`\nFinal Variant Stock: Initial=${sampleVariant.stock}, After 1 order placed=${finalVariant?.stock}`);
  if (finalVariant?.stock === sampleVariant.stock - 1) {
    console.log('  Result: ATOMIC STOCK DECREMENT CONFIRMED ON DATABASE ✅');
  }
}

runRpcVerification();

