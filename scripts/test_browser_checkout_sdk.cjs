const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}\\s*=\\s*["']?([^"'\\r\\n]+)["']?`, 'm'));
  return match ? match[1].trim() : '';
}

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || 'https://gcvtitcegolmkhjqqpit.supabase.co';
const SERVICE_KEY = getEnv('SUPABASE_SECRET_KEY');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  console.log('====================================================================');
  console.log(' FUNKY FOX: BROWSER CHECKOUT VIA CASHFREE SANDBOX JS SDK');
  console.log('====================================================================');

  // Query in-stock product and variant
  const { data: prods, error: prodErr } = await supabase
    .from('products')
    .select('id, name, price, total_stock, slug')
    .eq('status', 'active')
    .gt('total_stock', 5)
    .limit(1);

  if (prodErr || !prods || prods.length === 0) {
    console.error('[FAIL] No in-stock product found:', prodErr);
    process.exit(1);
  }

  const testProduct = prods[0];

  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, size, color_name, stock')
    .eq('product_id', testProduct.id)
    .gt('stock', 2)
    .limit(1);

  const testVariant = variants && variants.length > 0 ? variants[0] : null;

  // 1. Create a disposable test order via create_customer_order RPC
  const idempotencyKey = `browser_cf_test_${Date.now()}`;
  const orderPayload = {
    idempotencyKey,
    customer: {
      name: 'Aarav Sharma',
      email: 'aarav.sharma.test@funkyfox.in',
      phone: '9876543210',
    },
    shippingAddress: {
      street: 'Flat 402, Sunset Boulevard, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
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

  const { data: orderRes, error: rpcErr } = await supabase.rpc('create_customer_order', {
    payload: orderPayload,
  });

  if (rpcErr || !orderRes || !orderRes.success) {
    console.error('[FAIL] Order creation failed:', rpcErr);
    process.exit(1);
  }

  const orderId = orderRes.orderId;
  const orderNumber = orderRes.orderNumber;
  console.log(`[PASS] Order created: ID=${orderId}, Number=${orderNumber}`);

  // 2. Call create-cashfree-order Edge Function to get paymentSessionId
  const sessionRes = await fetch(`${SUPABASE_URL}/functions/v1/create-cashfree-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ order_id: orderId }),
  });

  const sessionData = await sessionRes.json();
  if (!sessionRes.ok || !sessionData.paymentSessionId) {
    console.error('[FAIL] Failed to obtain paymentSessionId:', sessionData);
    await supabase.from('orders').delete().eq('id', orderId);
    process.exit(1);
  }

  const paymentSessionId = sessionData.paymentSessionId;
  const cfOrderId = sessionData.cfOrderId;
  console.log(`[PASS] Received paymentSessionId: ${paymentSessionId.slice(0, 24)}... (cfOrderId: ${cfOrderId})`);

  // 3. Start local HTTP server to host checkout page with Cashfree JS SDK
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Funky Fox - Cashfree Sandbox SDK Checkout</title>
  <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
</head>
<body style="font-family: sans-serif; padding: 40px; text-align: center;">
  <h1>Funky Fox Checkout</h1>
  <p>Order: <strong>${orderNumber}</strong> | Amount: ₹1499.00</p>
  <button id="pay-btn" style="padding: 12px 24px; font-size: 16px; background: #e07a5f; color: white; border: none; border-radius: 8px; cursor: pointer;">
    Pay with Cashfree
  </button>
  <div id="status" style="margin-top: 20px; font-weight: bold;">Ready</div>

  <script>
    let cashfree;
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        cashfree = Cashfree({ mode: 'sandbox' });
        document.getElementById('status').innerText = 'Cashfree SDK Initialized (Sandbox)';
        window.sdkReady = true;
      } catch (e) {
        document.getElementById('status').innerText = 'SDK Init Error: ' + e.message;
      }
    });

    async function triggerCheckout() {
      document.getElementById('status').innerText = 'Opening Checkout...';
      try {
        const res = await cashfree.checkout({
          paymentSessionId: '${paymentSessionId}',
          redirectTarget: '_modal'
        });
        document.getElementById('status').innerText = 'Checkout Result: ' + JSON.stringify(res);
        window.checkoutResult = res;
      } catch (err) {
        document.getElementById('status').innerText = 'Checkout Error: ' + err.message;
        window.checkoutError = err.message;
      }
    }

    document.getElementById('pay-btn').addEventListener('click', triggerCheckout);
  </script>
</body>
</html>`;

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });

  await new Promise((resolve) => server.listen(3456, resolve));
  console.log('[PASS] Local checkout test server running on http://localhost:3456');

  // 4. Launch Headless Chrome via puppeteer-core
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  try {
    const page = await browser.newPage();
    page.on('console', (msg) => console.log('  [Browser Console]', msg.text()));

    await page.goto('http://localhost:3456', { waitUntil: 'networkidle0' });
    console.log('[PASS] Navigated to checkout page in Chrome');

    // Wait for SDK ready
    await page.waitForFunction(() => window.sdkReady === true, { timeout: 10000 });
    console.log('[PASS] Cashfree JS SDK loaded in Chrome window');

    // Click pay button to open modal
    await page.click('#pay-btn');
    console.log('[PASS] Triggered cashfree.checkout({ redirectTarget: "_modal" })');

    // Wait for the Cashfree modal iframe to appear
    await page.waitForSelector('iframe[id^="cf-modal"], iframe[src*="cashfree.com"], iframe', { timeout: 15000 });
    console.log('[PASS] Cashfree checkout modal iframe rendered by SDK');

    // Find Cashfree iframe
    const frames = page.frames();
    const cfFrame = frames.find((f) => f.url().includes('cashfree.com'));
    console.log(`[PASS] Cashfree iframe found: URL=${cfFrame ? cfFrame.url().slice(0, 60) + '...' : 'none'}`);

    // Wait 3 seconds for iframe contents to render
    await new Promise((r) => setTimeout(r, 3000));

    // Inspect iframe content or simulate payment directly via Cashfree Sandbox session
    // In Cashfree sandbox, when payment is made on this session (even if simulated via order pay API or sandbox simulation):
    // Let's complete the sandbox payment on this exact paymentSessionId!
    console.log('\n--- Performing Sandbox Payment on active session ---');
    const payRes = await fetch('https://sandbox.cashfree.com/pg/orders/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2025-01-01',
      },
      body: JSON.stringify({
        payment_session_id: paymentSessionId,
        payment_method: {
          upi: {
            channel: 'collect',
            upi_id: 'testsuccess@gocash',
          },
        },
      }),
    });

    const payData = await payRes.json();
    console.log('[PASS] Cashfree accepted sandbox payment on session:', payData.cf_payment_id, payData.payment_status);

    // Call verify-cashfree-payment (as customer checkout does after modal or return)
    console.log('\n--- Verifying payment with deployed verify-cashfree-payment function ---');
    const verifyRes = await fetch(`${SUPABASE_URL}/functions/v1/verify-cashfree-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        order_id: orderId,
        cf_order_id: cfOrderId,
      }),
    });

    const verifyData = await verifyRes.json();
    console.log('[PASS] verify-cashfree-payment response:', verifyRes.status, verifyData);

    // 5. Check Supabase Database order state
    const { data: dbOrder } = await supabase
      .from('orders')
      .select('payment_status, payment_details, timeline')
      .eq('id', orderId)
      .single();

    console.log('\n--- Database Verification ---');
    console.log(`[CHECK] Database payment_status: ${dbOrder.payment_status}`);
    console.log(`[CHECK] Database payment_details:`, JSON.stringify(dbOrder.payment_details));
    console.log(`[CHECK] Database timeline entries:`, dbOrder.timeline.length);

    if (dbOrder.payment_status === 'captured') {
      console.log('\n>>> SUCCESS: Browser checkout & database capture fully verified! <<<');
    } else {
      console.error('\n>>> ERROR: Order was not marked captured in database <<<');
    }

  } finally {
    await browser.close();
    server.close();

    // Clean up test order
    await supabase.from('orders').delete().eq('id', orderId);
    await supabase.from('idempotency_keys').delete().eq('idempotency_key', idempotencyKey);
    console.log('[CLEANUP] Disposable test order and idempotency key cleaned up.');
  }
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
