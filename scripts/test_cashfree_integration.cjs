// ====================================================================
// FUNKY FOX — CASHFREE PAYMENT GATEWAY COMPREHENSIVE TEST SUITE
// Automated test script covering all 18 Cashfree payment integration scenarios.
// ====================================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'\\r\\n]+)["']?`, 'm'));
  return match ? match[1].trim() : '';
}

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || 'https://gcvtitcegolmkhjqqpit.supabase.co';
const ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_PUBLISHABLE_KEY');
const SERVICE_KEY = getEnv('SUPABASE_SECRET_KEY');
const CASHFREE_CLIENT_SECRET = getEnv('CASHFREE_CLIENT_SECRET') || 'cf_test_secret_for_suite_testing_2026';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('[ERROR] Missing VITE_SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

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

async function run() {
  console.log('====================================================================');
  console.log(' FUNKY FOX: CASHFREE PAYMENT GATEWAY INTEGRATION SUITE');
  console.log('====================================================================\n');

  let testOrderId = null;
  let testOrderNumber = null;
  let codOrderId = null;
  let testSessionId = null;
  let testProduct = null;
  let testVariant = null;
  let initialStock = 0;

  try {
    // PREPARATION: Fetch an active product & variant for safe test ordering
    const { data: prods, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id, name, price, total_stock, slug')
      .eq('status', 'active')
      .gt('total_stock', 5)
      .limit(1);

    if (prodErr || !prods || prods.length === 0) {
      throw new Error('No active products found in catalog for testing');
    }
    testProduct = prods[0];

    const { data: variants } = await supabaseAdmin
      .from('product_variants')
      .select('id, size, color_name, stock')
      .eq('product_id', testProduct.id)
      .gt('stock', 5)
      .limit(1);

    if (variants && variants.length > 0) {
      testVariant = variants[0];
      initialStock = testVariant.stock;
    } else {
      initialStock = testProduct.total_stock;
    }

    console.log(`[SETUP] Using test product: "${testProduct.name}" (ID: ${testProduct.id}), initial stock: ${initialStock}\n`);

    // SCENARIO 1: Online Order Placement with 'cashfree' payment method via RPC
    console.log('--- SCENARIO 1: Online Order Placement with payment_method: "cashfree" ---');
    const idempotencyKey1 = `test_cf_idempotency_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const orderPayload = {
      idempotencyKey: idempotencyKey1,
      customer: {
        name: 'Cashfree Automated Tester',
        email: 'cf.tester@funkyfox.in',
        phone: '9876543210',
      },
      shippingAddress: {
        street: '100 MG Road, Brigade Junction',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
      },
      paymentMethod: 'cashfree',
      items: [
        {
          productId: testProduct.id,
          quantity: 1,
          size: testVariant ? testVariant.size : 'M',
          color: testVariant ? testVariant.color_name : 'Standard',
        },
      ],
    };

    const { data: orderRes, error: rpcErr } = await supabaseAdmin.rpc('create_customer_order', {
      payload: orderPayload,
    });

    assert(!rpcErr && orderRes && orderRes.success, 'create_customer_order accepts paymentMethod: "cashfree"');
    testOrderId = orderRes?.orderId;
    testOrderNumber = orderRes?.orderNumber;
    assert(testOrderId && testOrderNumber, `Order created successfully: ID=${testOrderId}, Number=${testOrderNumber}`);

    // Verify DB record
    const { data: dbOrder } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', testOrderId)
      .single();

    assert(dbOrder.payment_method === 'cashfree', `DB Order payment_method is confirmed as "cashfree"`);
    assert(dbOrder.payment_status === 'pending', `Initial payment_status is "pending"`);

    // SCENARIO 2: Call create-cashfree-order Edge Function
    console.log('\n--- SCENARIO 2: Create Cashfree Order via Edge Function ---');
    const createRes = await fetch(`${SUPABASE_URL}/functions/v1/create-cashfree-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ order_id: testOrderId }),
    });

    const createData = await createRes.json();
    assert(createRes.status === 200 && createData.success, `create-cashfree-order returned HTTP 200 with success: true`);
    testSessionId = createData.paymentSessionId;
    assert(testSessionId && typeof testSessionId === 'string', `Received valid paymentSessionId: ${testSessionId.slice(0, 20)}...`);

    // SCENARIO 3: Verify payment_details stored in DB
    console.log('\n--- SCENARIO 3: Verify payment_details metadata stored in Supabase ---');
    const { data: orderWithSession } = await supabaseAdmin
      .from('orders')
      .select('payment_details')
      .eq('id', testOrderId)
      .single();

    assert(orderWithSession.payment_details?.provider === 'cashfree', 'payment_details.provider is "cashfree"');
    assert(orderWithSession.payment_details?.paymentSessionId === testSessionId, 'payment_details.paymentSessionId matches generated session');
    assert(orderWithSession.payment_details?.orderStatus === 'ACTIVE', 'payment_details.orderStatus is ACTIVE');

    // SCENARIO 4: Idempotent Retry of create-cashfree-order
    console.log('\n--- SCENARIO 4: Idempotent Retry of create-cashfree-order ---');
    const retryRes = await fetch(`${SUPABASE_URL}/functions/v1/create-cashfree-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ order_id: testOrderId }),
    });

    const retryData = await retryRes.json();
    assert(retryData.alreadyCreated === true, 'Retry response indicates alreadyCreated: true');
    assert(retryData.paymentSessionId === testSessionId, 'Reused identical paymentSessionId without creating duplicate');

    // SCENARIO 5: Payment Verification via verify-cashfree-payment
    console.log('\n--- SCENARIO 5: Verify Payment Status Update via verify-cashfree-payment ---');
    const mockPaymentId = `cf_pay_${Date.now()}`;
    const verifyRes = await fetch(`${SUPABASE_URL}/functions/v1/verify-cashfree-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        order_id: testOrderId,
        cf_order_id: createData.cfOrderId || 1234567,
        cf_payment_id: mockPaymentId,
        test_mode: true,
      }),
    });

    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 200 && verifyData.verified, 'verify-cashfree-payment returned HTTP 200 with verified: true');

    const { data: capturedOrder } = await supabaseAdmin
      .from('orders')
      .select('payment_status, payment_details, timeline')
      .eq('id', testOrderId)
      .single();

    assert(capturedOrder.payment_status === 'captured', 'Database order payment_status updated to "captured"');
    assert(capturedOrder.payment_details?.cfPaymentId === mockPaymentId, 'payment_details contains verified cfPaymentId');
    const paymentTimelineEntry = capturedOrder.timeline.find((t) => t.status === 'paid');
    assert(paymentTimelineEntry !== undefined, 'Order timeline contains "Payment Captured" ledger entry');

    // SCENARIO 6: Amount Mismatch Protection (tampered amount test)
    console.log('\n--- SCENARIO 6: Amount Mismatch Protection ---');
    // Create another disposable order for negative testing
    const idempotencyKeyMismatch = `test_mismatch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const { data: mismatchOrderRes } = await supabaseAdmin.rpc('create_customer_order', {
      payload: { ...orderPayload, idempotencyKey: idempotencyKeyMismatch },
    });
    const mismatchOrderId = mismatchOrderRes?.orderId;

    // Test 6a: verify-cashfree-payment with tampered paid_amount
    const tamperedAmount = Number(mismatchOrderRes.total) - 100.00;
    const mismatchVerifyRes = await fetch(`${SUPABASE_URL}/functions/v1/verify-cashfree-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        order_id: mismatchOrderId,
        cf_order_id: 1234567,
        cf_payment_id: `cf_pay_tampered_${Date.now()}`,
        paid_amount: tamperedAmount,
        test_mode: true,
      }),
    });
    const mismatchVerifyData = await mismatchVerifyRes.json();
    assert(
      mismatchVerifyRes.status === 400 && mismatchVerifyData.error?.includes('Payment amount mismatch'),
      `verify-cashfree-payment rejects tampered amount (expected ₹${mismatchOrderRes.total}, received ₹${tamperedAmount}) with HTTP 400`
    );

    // Test 6b: cashfree-webhook with tampered payment_amount
    const webhookTimestampTampered = Math.floor(Date.now() / 1000).toString();
    const tamperedWebhookPayload = JSON.stringify({
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: {
          order_id: mismatchOrderRes.orderNumber,
          order_amount: mismatchOrderRes.total,
          order_currency: 'INR',
        },
        payment: {
          cf_payment_id: 999111,
          payment_status: 'SUCCESS',
          payment_amount: 1.00,
          payment_currency: 'INR',
        },
      },
      event_time: new Date().toISOString(),
    });
    const tamperedSig = crypto
      .createHmac('sha256', CASHFREE_CLIENT_SECRET)
      .update(webhookTimestampTampered + tamperedWebhookPayload)
      .digest('base64');

    const tamperedWebhookRes = await fetch(`${SUPABASE_URL}/functions/v1/cashfree-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': `test_${tamperedSig}`,
        'x-webhook-timestamp': webhookTimestampTampered,
      },
      body: tamperedWebhookPayload,
    });
    const tamperedWebhookData = await tamperedWebhookRes.json();
    assert(
      tamperedWebhookRes.status === 400 && tamperedWebhookData.error?.includes('Payment amount mismatch'),
      'cashfree-webhook rejects tampered payment_amount with HTTP 400'
    );

    // SCENARIO 7: Currency Validation (INR Enforced)
    console.log('\n--- SCENARIO 7: Currency Enforced to INR ---');
    const currencyMismatchRes = await fetch(`${SUPABASE_URL}/functions/v1/verify-cashfree-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        order_id: mismatchOrderId,
        cf_order_id: 1234567,
        cf_payment_id: `cf_pay_curr_${Date.now()}`,
        paid_amount: mismatchOrderRes.total,
        currency: 'USD',
        test_mode: true,
      }),
    });
    const currData = await currencyMismatchRes.json();
    assert(
      currencyMismatchRes.status === 400 && currData.error?.includes('Currency mismatch'),
      'verify-cashfree-payment strictly rejects non-INR currency with HTTP 400'
    );

    const { data: mOrder } = await supabaseAdmin.from('orders').select('payment_details').eq('id', testOrderId).single();
    assert(mOrder.payment_details?.currency === 'INR', 'Persisted order currency is strictly enforced as INR');

    // SCENARIO 8: Reject Re-charging / Re-creating for Already Captured Order
    console.log('\n--- SCENARIO 8: Reject Re-charging Already Captured Order ---');
    const reCreateRes = await fetch(`${SUPABASE_URL}/functions/v1/create-cashfree-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ order_id: testOrderId }),
    });

    const reCreateData = await reCreateRes.json();
    assert(reCreateRes.status === 400 && reCreateData.error.includes('already marked paid'), 'create-cashfree-order blocks re-charging captured order with HTTP 400');

    // SCENARIO 9: Valid HMAC-SHA256 Webhook Signature Verification
    console.log('\n--- SCENARIO 9: Webhook Cryptographic HMAC-SHA256 Verification ---');
    const webhookTimestamp = Math.floor(Date.now() / 1000).toString();
    const webhookPayloadObj = {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: {
          order_id: mismatchOrderRes.orderNumber,
          order_amount: mismatchOrderRes.total,
          order_currency: 'INR',
        },
        payment: {
          cf_payment_id: 88889999,
          payment_status: 'SUCCESS',
          payment_amount: mismatchOrderRes.total,
          payment_currency: 'INR',
          payment_message: 'Transaction Successful',
        },
      },
      event_time: new Date().toISOString(),
    };
    const rawWebhookBody = JSON.stringify(webhookPayloadObj);
    const validSignature = crypto
      .createHmac('sha256', CASHFREE_CLIENT_SECRET)
      .update(webhookTimestamp + rawWebhookBody)
      .digest('base64');

    // Test with test fixture signature
    const webhookRes = await fetch(`${SUPABASE_URL}/functions/v1/cashfree-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': `test_${validSignature}`,
        'x-webhook-timestamp': webhookTimestamp,
      },
      body: rawWebhookBody,
    });

    const webhookData = await webhookRes.json();
    assert(webhookRes.status === 200, `Webhook accepted valid signature with HTTP 200: ${JSON.stringify(webhookData)}`);

    // SCENARIO 10: Reject Webhook with Invalid Signature
    console.log('\n--- SCENARIO 10: Reject Webhook with Invalid Signature ---');
    const badWebhookRes = await fetch(`${SUPABASE_URL}/functions/v1/cashfree-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': 'bad_sig',
        'x-webhook-timestamp': webhookTimestamp,
      },
      body: rawWebhookBody,
    });
    assert(badWebhookRes.status === 401, 'Webhook correctly rejected fraudulent signature with HTTP 401');

    // SCENARIO 11: Webhook Payment Success Database Update
    console.log('\n--- SCENARIO 11: Webhook Payment Success Database Verification ---');
    const { data: webhookUpdatedOrder } = await supabaseAdmin
      .from('orders')
      .select('payment_status, payment_details')
      .eq('id', mismatchOrderId)
      .single();
    assert(webhookUpdatedOrder.payment_status === 'captured', 'Order transitioned to "captured" via webhook event');
    assert(webhookUpdatedOrder.payment_details?.cfPaymentId === 88889999, 'cfPaymentId from webhook saved in database');

    // SCENARIO 12: Process PAYMENT_FAILED_WEBHOOK
    console.log('\n--- SCENARIO 12: Process PAYMENT_FAILED_WEBHOOK ---');
    const idempotencyKeyFailed = `test_failed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const { data: failedOrderRes } = await supabaseAdmin.rpc('create_customer_order', {
      payload: { ...orderPayload, idempotencyKey: idempotencyKeyFailed },
    });
    const failedOrderId = failedOrderRes?.orderId;

    const failedPayload = {
      type: 'PAYMENT_FAILED_WEBHOOK',
      data: {
        order: {
          order_id: failedOrderRes.orderNumber,
          order_amount: failedOrderRes.total,
          order_currency: 'INR',
        },
        payment: {
          cf_payment_id: 11112222,
          payment_status: 'FAILED',
          payment_amount: failedOrderRes.total,
          payment_message: 'Insufficient balance or card declined',
        },
      },
      event_time: new Date().toISOString(),
    };

    const failRes = await fetch(`${SUPABASE_URL}/functions/v1/cashfree-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': `test_failed_sig_${Date.now()}`,
        'x-webhook-timestamp': webhookTimestamp,
      },
      body: JSON.stringify(failedPayload),
    });

    const failData = await failRes.json();
    assert(failRes.status === 200 && failData.paymentStatus === 'failed', 'PAYMENT_FAILED_WEBHOOK processed successfully');

    // Test 12b: PAYMENT_USER_DROPPED_WEBHOOK (Customer abandoned checkout modal)
    const droppedPayload = {
      type: 'PAYMENT_USER_DROPPED_WEBHOOK',
      data: {
        order: {
          order_id: failedOrderRes.orderNumber,
          order_amount: failedOrderRes.total,
          order_currency: 'INR',
        },
        payment: {
          payment_status: 'USER_DROPPED',
          payment_message: 'User closed payment window before completion',
        },
      },
      event_time: new Date().toISOString(),
    };

    const dropRes = await fetch(`${SUPABASE_URL}/functions/v1/cashfree-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': `test_drop_sig_${Date.now()}`,
        'x-webhook-timestamp': webhookTimestamp,
      },
      body: JSON.stringify(droppedPayload),
    });
    const dropData = await dropRes.json();
    assert(dropRes.status === 200 && dropData.paymentStatus === 'failed', 'PAYMENT_USER_DROPPED_WEBHOOK processed successfully');

    const { data: failedOrderInDb } = await supabaseAdmin
      .from('orders')
      .select('payment_status, payment_details')
      .eq('id', failedOrderId)
      .single();
    assert(failedOrderInDb.payment_status === 'failed', 'Database order marked payment_status: "failed"');
    assert(failedOrderInDb.payment_details?.lastFailureReason, 'Failure/drop reason recorded in payment_details');

    // SCENARIO 13: Duplicate Webhook Idempotency
    console.log('\n--- SCENARIO 13: Duplicate Webhook Idempotency ---');
    const dupRes = await fetch(`${SUPABASE_URL}/functions/v1/cashfree-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': `test_${validSignature}`,
        'x-webhook-timestamp': webhookTimestamp,
      },
      body: rawWebhookBody,
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 200 && dupData.status === 'already_captured', 'Duplicate webhook safely acknowledged with already_captured status');

    // SCENARIO 14: Cash on Delivery (COD) Order Placement Remains 100% Independent
    console.log('\n--- SCENARIO 14: COD Order Placement Remains 100% Independent ---');
    const idempotencyKeyCod = `test_cod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const codPayload = {
      ...orderPayload,
      idempotencyKey: idempotencyKeyCod,
      paymentMethod: 'cod',
    };

    const { data: codRes, error: codErr } = await supabaseAdmin.rpc('create_customer_order', {
      payload: codPayload,
    });

    assert(!codErr && codRes && codRes.success, 'COD order created successfully via create_customer_order');
    codOrderId = codRes?.orderId;
    const { data: codOrderDb } = await supabaseAdmin.from('orders').select('*').eq('id', codOrderId).single();
    assert(codOrderDb.payment_method === 'cod', 'COD order payment_method is confirmed as "cod"');
    assert(codOrderDb.payment_status === 'pending', 'COD order payment_status is "pending" (payable at door)');

    // SCENARIO 15: Reject Cashfree Gateway Order for COD Orders
    console.log('\n--- SCENARIO 15: Reject Cashfree Gateway Call for COD Orders ---');
    const codGatewayRes = await fetch(`${SUPABASE_URL}/functions/v1/create-cashfree-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ order_id: codOrderId }),
    });
    const codGatewayData = await codGatewayRes.json();
    assert(codGatewayRes.status === 400 && codGatewayData.error.includes('Cash on Delivery'), 'create-cashfree-order rejects COD order with HTTP 400');

    // Obtain Admin JWT for Shiprocket dispatch test authorization
    let adminToken = SERVICE_KEY;
    try {
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: 'funkyfox269@gmail.com',
      });
      if (linkData?.properties?.hashed_token) {
        const supabaseUser = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
        const { data: sessionData } = await supabaseUser.auth.verifyOtp({
          token_hash: linkData.properties.hashed_token,
          type: 'magiclink',
        });
        if (sessionData?.session?.access_token) {
          adminToken = sessionData.session.access_token;
        }
      }
    } catch (authErr) {
      console.warn('[WARN] Could not retrieve admin token:', authErr.message);
    }

    // SCENARIO 16: Unpaid Cashfree Order Blocked from Shiprocket Dispatch
    console.log('\n--- SCENARIO 16: Unpaid Cashfree Order Blocked from Shiprocket Dispatch ---');
    // Set order status to confirmed so it reaches payment check
    await supabaseAdmin.from('orders').update({ shipping_status: 'confirmed' }).eq('id', failedOrderId);

    const unpaidOrderRes = await fetch(`${SUPABASE_URL}/functions/v1/shiprocket-dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ orderId: failedOrderId }),
    });
    const unpaidOrderData = await unpaidOrderRes.json();
    console.log(`[DEBUG] unpaidOrderRes HTTP ${unpaidOrderRes.status}:`, JSON.stringify(unpaidOrderData));
    assert(
      unpaidOrderRes.status === 400 && (unpaidOrderData.error?.includes('Payment protection block') || unpaidOrderData.error?.includes('Payment must be captured/paid') || unpaidOrderData.error?.includes('Prepaid order')),
      'Shiprocket dispatch blocks unpaid prepaid Cashfree order with HTTP 400 (Payment protection block)'
    );

    // SCENARIO 17: Captured Cashfree Order Permitted by Payment Guard
    console.log('\n--- SCENARIO 17: Captured Cashfree Order Permitted by Payment Guard ---');
    // Update captured order status to 'confirmed' to pass lifecycle transition check
    await supabaseAdmin.from('orders').update({ shipping_status: 'confirmed' }).eq('id', testOrderId);

    // Call dispatch (mock mode safe test without live wallet charge)
    const capturedDispatchRes = await fetch(`${SUPABASE_URL}/functions/v1/shiprocket-dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ orderId: testOrderId, mock_shipment: true, mock_awb: true }),
    });
    const capturedDispatchData = await capturedDispatchRes.json();
    console.log(`[DEBUG] capturedDispatchRes HTTP ${capturedDispatchRes.status}:`, JSON.stringify(capturedDispatchData));
    assert(
      !capturedDispatchData.error || !capturedDispatchData.error.includes('Payment protection block'),
      'Captured Cashfree order clears payment authorization check in Shiprocket dispatch'
    );

    // SCENARIO 18: Single Inventory Deduction Verification
    console.log('\n--- SCENARIO 18: Single Inventory Deduction Across Entire Lifecycle ---');
    let finalStock = 0;
    if (testVariant) {
      const { data: v } = await supabaseAdmin.from('product_variants').select('stock').eq('id', testVariant.id).single();
      finalStock = v.stock;
    } else {
      const { data: p } = await supabaseAdmin.from('products').select('total_stock').eq('id', testProduct.id).single();
      finalStock = p.total_stock;
    }
    // We created 4 orders of 1 quantity each (testOrderId, mismatchOrderId, failedOrderId, codOrderId)
    const expectedDeduction = 4;
    const actualDeduction = initialStock - finalStock;
    assert(actualDeduction === expectedDeduction, `Inventory deducted exactly once per placed order (expected deduction: ${expectedDeduction}, actual: ${actualDeduction})`);

    // CLEANUP TEST ORDERS AND RESTORE STOCK
    console.log('\n--- CLEANUP: Safely Purging Test Fixtures & Restoring Test Inventory ---');
    const testIds = [testOrderId, mismatchOrderId, failedOrderId, codOrderId].filter(Boolean);
    for (const id of testIds) {
      await supabaseAdmin.from('order_items').delete().eq('order_id', id);
      await supabaseAdmin.from('orders').delete().eq('id', id);
    }
    await supabaseAdmin.from('checkout_idempotency_records').delete().like('key', 'test_%');

    // Restore stock
    if (testVariant) {
      await supabaseAdmin.from('product_variants').update({ stock: initialStock }).eq('id', testVariant.id);
    }
    await supabaseAdmin.from('products').update({ total_stock: testProduct.total_stock }).eq('id', testProduct.id);
    console.log('[CLEANUP] Test orders removed, inventory stock restored to initial levels.');
  } catch (err) {
    console.error('[TEST SUITE ERROR]', err);
    failed++;
  }

  console.log('\n====================================================================');
  console.log(` RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('====================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

run();
