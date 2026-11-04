import { products, categories, ALL_SIZES } from '../src/data/products';
import { storeService } from '../src/admin/services/storeService';

console.log('=== PRODUCT CATALOG RUNTIME VERIFICATION ===');
console.log('Total products loaded:', products.length);

const categoryCounts: Record<string, number> = {};
const idSet = new Set<string>();
const duplicates: string[] = [];
let missingImages = 0;
let missingSizes = 0;
let missingColors = 0;

for (const p of products) {
  if (idSet.has(p.id)) {
    duplicates.push(p.id);
  }
  idSet.add(p.id);

  categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;

  if (!p.image || p.image.trim() === '') missingImages++;
  if (!p.sizes || p.sizes.length === 0) missingSizes++;
  if (!p.colors || p.colors.length === 0) missingColors++;
}

console.log('Unique product IDs:', idSet.size);
console.log('Duplicate IDs:', duplicates);
console.log('Category distribution:', categoryCounts);
console.log('Missing images:', missingImages);
console.log('Missing sizes:', missingSizes);
console.log('Missing colors:', missingColors);

// Now test storeService
console.log('\n=== STORE SERVICE VERIFICATION ===');
const adminProds = storeService.getProducts();
console.log('Total admin products:', adminProds.length);

let totalVariants = 0;
const variantIdSet = new Set<string>();
const duplicateVariants: string[] = [];

for (const ap of adminProds) {
  if (!ap.variants || ap.variants.length === 0) {
    console.error(`Product ${ap.id} has NO VARIANTS!`);
  } else {
    totalVariants += ap.variants.length;
    for (const v of ap.variants) {
      if (variantIdSet.has(v.id)) {
        duplicateVariants.push(v.id);
      }
      variantIdSet.add(v.id);
    }
  }
}

console.log('Total variants generated:', totalVariants);
console.log('Unique variant IDs:', variantIdSet.size);
console.log('Duplicate variant IDs:', duplicateVariants.length);
console.log('Store categories:', storeService.getCategories().map(c => ({ id: c.id, name: c.name, count: c.productCount })));

