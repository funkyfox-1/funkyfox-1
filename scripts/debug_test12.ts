import { products } from '../src/data/products';
import { storeService } from '../src/admin/services/storeService';

const p0 = products[0];
const authRecord = storeService.getProductById(p0.id);
console.log('p0 id:', p0.id);
console.log('authRecord found?', !!authRecord);
if (authRecord) {
  console.log('status:', authRecord.status);
  console.log('totalStock:', authRecord.totalStock);
  console.log('variants count:', authRecord.variants?.length);
}

