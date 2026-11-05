// ====================================================================
// Test Execution: dispatch_test_order.cjs
// Triggers shiprocket-dispatch Edge Function for test order ord_3238ada1ebf44e368563ecce8cceb58d (FF-261104-921506)
// ====================================================================

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Read environment variables from .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'\\r\\n]+)["']?`, 'm'));
  return match ? match[1].trim() : '';
}

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_PUBLISHABLE_KEY');
const SERVICE_KEY = getEnv('SUPABASE_SECRET_KEY');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('[ERROR] Missing VITE_SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const TEST_ORDER_ID = 'ord_38663a7f3459473193d512a6e729472e';
const TEST_ORDER_NUMBER = 'FF-261104-462944';

async function run() {
  console.log('====================================================================');
  console.log(` TRIGGERING DISPATCH TEST FOR ORDER: ${TEST_ORDER_NUMBER}`);
  console.log('====================================================================');

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // Step 1: Pre-flight state check
  console.log('[Step 1] Verifying pre-dispatch order status in database...');
  const { data: initialOrder, error: initialErr } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, payment_method, payment_status, shipping_status, fulfillment_status, shipment_details')
    .eq('id', TEST_ORDER_ID)
    .single();

  if (initialErr || !initialOrder) {
    console.error('[ERROR] Failed to fetch test order:', initialErr);
    process.exit(1);
  }

  console.log(`   Order Number:       ${initialOrder.order_number}`);
  console.log(`   Payment Method:     ${initialOrder.payment_method}`);
  console.log(`   Payment Status:     ${initialOrder.payment_status}`);
  console.log(`   Shipping Status:    ${initialOrder.shipping_status}`);
  console.log(`   Fulfillment Status: ${initialOrder.fulfillment_status}`);

  if (initialOrder.shipping_status !== 'pending') {
    console.warn(`[WARN] Order is currently at status: "${initialOrder.shipping_status}"`);
  }

  // Step 2: Authenticate Admin Session
  console.log('\n[Step 2] Authenticating administrative session for dispatch authorization...');
  const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: 'funkyfox269@gmail.com',
  });

  if (linkErr || !linkData?.properties?.hashed_token) {
    console.error('[ERROR] Failed to generate admin magiclink token:', linkErr);
    process.exit(1);
  }

  const supabaseUser = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
  });

  const { data: sessionData, error: sessionErr } = await supabaseUser.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  });

  if (sessionErr || !sessionData?.session?.access_token) {
    console.error('[ERROR] Failed to establish admin session from token:', sessionErr);
    process.exit(1);
  }

  const adminToken = sessionData.session.access_token;
  console.log('   Admin session verified successfully.');

  // Step 3: Invoke shiprocket-dispatch Edge Function
  console.log('\n[Step 3] Invoking shiprocket-dispatch Edge Function (Version 7)...');
  const dispatchUrl = `${SUPABASE_URL}/functions/v1/shiprocket-dispatch`;
  
  const startTime = Date.now();
  const res = await fetch(dispatchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      order_id: TEST_ORDER_ID,
    }),
  });

  const durationMs = Date.now() - startTime;
  const dispatchResult = await res.json();

  console.log(`   HTTP Status: ${res.status} (${durationMs}ms)`);
  console.log('   Edge Function Response:');
  console.log(JSON.stringify(dispatchResult, null, 2));

  if (!res.ok || !dispatchResult.success) {
    console.error('[FAIL] shiprocket-dispatch returned an error:', dispatchResult);
    process.exit(1);
  }

  // Step 4: Verify Database State Post-Dispatch
  console.log('\n[Step 4] Verifying updated order state in database...');
  const { data: updatedOrder, error: updateErr } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, shipping_status, fulfillment_status, shipment_details, timeline')
    .eq('id', TEST_ORDER_ID)
    .single();

  if (updateErr || !updatedOrder) {
    console.error('[ERROR] Failed to query updated order:', updateErr);
    process.exit(1);
  }

  console.log('====================================================================');
  console.log(' POST-DISPATCH VERIFICATION RESULTS');
  console.log('====================================================================');
  console.log(`   Order Number:       ${updatedOrder.order_number}`);
  console.log(`   Shipping Status:    ${updatedOrder.shipping_status} (Expected: 'packed')`);
  console.log(`   Fulfillment Status: ${updatedOrder.fulfillment_status} (Expected: 'fulfilled')`);
  console.log(`   Shipment ID:        ${updatedOrder.shipment_details?.shipmentId}`);
  console.log(`   Shiprocket Order ID:${updatedOrder.shipment_details?.shiprocketOrderId}`);
  console.log(`   AWB Code:           ${updatedOrder.shipment_details?.awbCode}`);
  console.log(`   Courier Name:       ${updatedOrder.shipment_details?.courierName}`);
  console.log(`   Tracking URL:       ${updatedOrder.shipment_details?.trackingUrl}`);
  console.log(`   Dispatched At:      ${updatedOrder.shipment_details?.dispatchedAt}`);
  console.log(`   Dispatched By:      ${updatedOrder.shipment_details?.dispatchedBy}`);
  
  const latestTimeline = (updatedOrder.timeline || []).slice(-1)[0];
  console.log(`   Latest Timeline:    [${latestTimeline?.status}] ${latestTimeline?.label} — ${latestTimeline?.description}`);

  // Assertions
  if (updatedOrder.shipping_status === 'packed') {
    console.log('\n[PASS] STATUS TRANSITION VERIFIED: pending -> packed SUCCEEDED!');
  } else {
    console.error(`\n[FAIL] STATUS MISMATCH: Expected 'packed', found '${updatedOrder.shipping_status}'`);
  }

  if (updatedOrder.shipment_details?.awbCode) {
    console.log('[PASS] AWB CODE GENERATION VERIFIED:', updatedOrder.shipment_details.awbCode);
  } else {
    console.error('[FAIL] AWB Code was not assigned.');
  }

  console.log('====================================================================\n');
}

run().catch((err) => {
  console.error('[UNHANDLED ERROR]:', err);
  process.exit(1);
});

