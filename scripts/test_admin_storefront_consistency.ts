import { storeService } from '../src/admin/services/storeService';
import { products } from '../src/data/products';

// Mock localStorage in Node environment
const storageMock: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (k: string) => storageMock[k] || null,
  setItem: (k: string, v: string) => { storageMock[k] = v; },
  removeItem: (k: string) => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
};
let eventDispatched = false;
(global as any).window = {
  dispatchEvent: (e: any) => { eventDispatched = true; return true; }
};

async function testAdminStorefrontConsistency() {
  console.log('=== ADMIN & STOREFRONT CONSISTENCY VERIFICATION ===\n');

  storeService.init();

  // 1. Admin Product Creation -> Storefront Appearance
  console.log('--- 6A: Admin Product Creation ---');
  const newProdId = `admin-sync-test-${Date.now()}`;
  storeService.saveProduct({
    id: newProdId,
    slug: newProdId,
    name: 'Sync Test Oxford Overshirt',
    sku: 'FF-SYNC-001',
    description: 'Testing live sync between admin and storefront',
    price: 2199,
    category: 'Shirts',
    image: '/images/category-shirts.jpg',
    status: 'active',
    totalStock: 10,
    variants: [
      {
        id: `${newProdId}-white-m`,
        productId: newProdId,
        size: 'M',
        colorName: 'White',
        colorHex: '#FFFFFF',
        sku: 'FF-SYNC-WHT-M',
        stock: 10,
        price: 2199,
        inStock: true
      }
    ]
  });

  const storefrontFind = products.find(p => p.id === newProdId);
  console.log('Product found in storefront products array?', !!storefrontFind);
  console.log('Event dispatched for live reactive UI update?', eventDispatched);
  if (storefrontFind && storefrontFind.name === 'Sync Test Oxford Overshirt') {
    console.log('Result: ADMIN CREATION SYNCS TO STOREFRONT ✅');
  } else {
    console.error('Result: FAILED to sync new product to storefront ❌');
  }

  // 2. Admin Price Changes -> Storefront Appearance
  console.log('\n--- 6B: Admin Price Modification ---');
  const prodToEdit = storeService.getProductById(newProdId);
  if (prodToEdit) {
    prodToEdit.price = 2499;
    storeService.saveProduct(prodToEdit);
    const updatedStorefront = products.find(p => p.id === newProdId);
    console.log(`Updated Price in storefront: ₹${updatedStorefront?.price}`);
    if (updatedStorefront?.price === 2499) {
      console.log('Result: PRICE CHANGE SYNCS TO STOREFRONT ✅');
    } else {
      console.error('Result: Price did not sync ❌');
    }
  }

  // 3. Admin Stock Changes -> Product Availability
  console.log('\n--- 6C: Admin Stock Zeroing -> Out of Stock Sync ---');
  storeService.adjustVariantStock(newProdId, `${newProdId}-white-m`, 0, 'inventory_audit', 'Audit count 0');
  const zeroStockProd = storeService.getProductById(newProdId);
  const zeroStockVar = zeroStockProd?.variants.find(v => v.id === `${newProdId}-white-m`);
  console.log('Variant stock in storeService:', zeroStockVar?.stock, 'inStock:', zeroStockVar?.inStock);
  const storefrontZeroProd = products.find(p => p.id === newProdId);
  console.log('Storefront product inStock status:', storefrontZeroProd?.inStock);
  if (zeroStockVar?.stock === 0 && !zeroStockVar.inStock && storefrontZeroProd?.inStock === false) {
    console.log('Result: STOCK DEPLETION MARKS PRODUCT OUT OF STOCK ON STOREFRONT ✅');
  } else {
    console.error('Result: Stock depletion not synced ❌');
  }

  // 4. Archival Disappearance from Public Listings
  console.log('\n--- 6D: Archiving Product -> Disappears from Storefront ---');
  storeService.bulkUpdateStatus([newProdId], 'archived');
  const archivedInStorefront = products.find(p => p.id === newProdId);
  console.log('Archived product found in active storefront?', !!archivedInStorefront);
  if (!archivedInStorefront) {
    console.log('Result: ARCHIVED PRODUCT AUTOMATICALLY REMOVED FROM STOREFRONT ✅');
  } else {
    console.error('Result: Archived product still present in storefront ❌');
  }

  // Clean up
  storeService.deleteProduct(newProdId);
}

testAdminStorefrontConsistency();
