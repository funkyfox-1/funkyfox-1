import { storeService } from '../src/admin/services/storeService';

// Mock localStorage in Node environment
const storageMock: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (k: string) => storageMock[k] || null,
  setItem: (k: string, v: string) => { storageMock[k] = v; },
  removeItem: (k: string) => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
};
(global as any).window = {
  dispatchEvent: () => true
};

async function testLocalDemoMode() {
  console.log('=== TEST LOCAL DEMO MODE (INDEPENDENT OF SUPABASE) ===\n');

  // Re-init storeService with local storage
  storeService.init();

  const products = storeService.getProducts();
  const sample = products[0];
  const sampleVariant = sample.variants[0];
  const initialStock = sampleVariant.stock;

  console.log(`Initial Local Product: "${sample.name}" (ID: ${sample.id})`);
  console.log(`Initial Variant Stock (${sampleVariant.colorName} / ${sampleVariant.size}): ${initialStock}\n`);

  // 1. Invalid Product Rejection in Local Mode
  console.log('--- 3A: Invalid Product Rejection in Local Mode ---');
  try {
    await storeService.createCustomerOrder({
      idempotencyKey: `local-idem-fail-${Date.now()}-123456`,
      customerName: 'Local Tester',
      customerEmail: 'local@test.com',
      customerPhone: '9493551595',
      deliveryAddress: {
        street: '12 Test Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      items: [
        {
          id: 'fake-local-product-id',
          name: 'Fake Local Item',
          price: 999,
          quantity: 1,
          size: 'M',
          color: 'Black',
          image: '/test.jpg'
        }
      ],
      subtotal: 999,
      total: 999
    });
    console.error('  Result: FAILED! Invalid product should have thrown error ❌');
  } catch (err: any) {
    console.log('  Result: REJECTED AS EXPECTED ✅');
    console.log('  Error message:', err.message);
  }

  // 2. Insufficient Stock Rejection in Local Mode
  console.log('\n--- 3B: Insufficient Stock Rejection in Local Mode ---');
  try {
    await storeService.createCustomerOrder({
      idempotencyKey: `local-idem-stock-${Date.now()}-123456`,
      customerName: 'Local Tester',
      customerEmail: 'local@test.com',
      customerPhone: '9493551595',
      deliveryAddress: {
        street: '12 Test Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      items: [
        {
          id: sample.id,
          name: sample.name,
          price: sample.price,
          quantity: initialStock + 10, // Exceeds stock
          size: sampleVariant.size,
          color: sampleVariant.colorName,
          image: sample.image
        }
      ],
      subtotal: sample.price,
      total: sample.price
    });
    console.error('  Result: FAILED! Excessive stock request should have thrown error ❌');
  } catch (err: any) {
    console.log('  Result: REJECTED AS EXPECTED ✅');
    console.log('  Error message:', err.message);
  }

  // 3. Valid Local Demo Order Placement & Distinct Labeling
  console.log('\n--- 3C: Valid Local Demo Order Placement ---');
  const validOrder = await storeService.createCustomerOrder({
    idempotencyKey: `local-idem-valid-${Date.now()}-123456`,
    customerName: 'Local Demo Shopper',
    customerEmail: 'demo.shopper@funkyfox.test',
    customerPhone: '9493551595',
    deliveryAddress: {
      street: '12 Test Lane',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    items: [
      {
        id: sample.id,
        name: sample.name,
        price: sample.price,
        quantity: 1,
        size: sampleVariant.size,
        color: sampleVariant.colorName,
        image: sample.image
      }
    ],
    subtotal: sample.price,
    total: sample.price,
    paymentMethod: 'cod'
  });

  console.log('  Created Order Number:', validOrder.orderNumber);
  console.log('  Order Notes / Label:', validOrder.notes);
  console.log('  Order Internal Notes:', validOrder.internalNotes);
  const isDistinctlyMarked = (validOrder.notes && validOrder.notes.includes('[LOCAL DEMO]')) ||
    (validOrder.internalNotes && validOrder.internalNotes.some(n => n.includes('[LOCAL DEMO]')));
  if (isDistinctlyMarked) {
    console.log('  Result: LOCAL DEMO MODE CLEARLY IDENTIFIED (NOT REPRESENTED AS CLOUD) ✅');
  } else {
    console.error('  Result: Missing distinct local demo flag ❌');
  }

  // 4. Persistence after Refresh
  console.log('\n--- 3D: Persistence After Simulated Page Refresh ---');
  const savedOrdersJson = storageMock['funkyfox_admin_orders'];
  console.log('  Storage has persisted orders?', !!savedOrdersJson);

  // Simulate fresh storeService instantiation reading from storage
  const freshStoreService = new (storeService.constructor as any)();
  const refreshedOrders = freshStoreService.getOrders();
  const foundOrder = refreshedOrders.find((o: any) => o.orderNumber === validOrder.orderNumber);
  console.log('  Order found in new storeService instance?', !!foundOrder);
  if (foundOrder) {
    console.log('  Result: LOCAL ORDER SUCCESSFULLY PERSISTED ACROSS SESSIONS ✅');
  }

  // 5. Stock Deduction Persistence
  const freshProd = freshStoreService.getProductById(sample.id);
  const freshVar = freshProd?.variants.find((v: any) => v.id === sampleVariant.id);
  console.log(`  Stock after reload: Initial=${initialStock}, New=${freshVar?.stock}`);
  if (freshVar?.stock === initialStock - 1) {
    console.log('  Result: INVENTORY DEDUCTION PERSISTED ACROSS SESSIONS ✅');
  }
}

testLocalDemoMode();

