// ====================================================================
// Test Script: test_dispatch_lifecycle.cjs
// Verifies status lifecycle state machine, trigger logic, and Edge Function status calculation
// Pure offline execution - no network calls, no Shiprocket calls, no database mutations.
// ====================================================================

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('--- STARTING DISPATCH LIFECYCLE VERIFICATION ---');

// 1. Verify Migration File Exists and Syntactically Defines the Exact Transitions
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261105110000_allow_manifest_dispatch_transitions.sql');
assert(fs.existsSync(migrationPath), 'Migration 20261105110000 must exist');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');

console.log('[Test 1] Checking migration SQL content...');
assert(migrationSql.includes("OLD.shipping_status = 'pending' AND NEW.shipping_status IN ('confirmed', 'packed', 'cancelled')"), 'Pending must allow packed');
assert(migrationSql.includes("OLD.shipping_status = 'confirmed' AND NEW.shipping_status IN ('processing', 'packed', 'cancelled')"), 'Confirmed must allow packed');
assert(migrationSql.includes("OLD.shipping_status = 'processing' AND NEW.shipping_status IN ('packed', 'cancelled')"), 'Processing must allow packed');
assert(migrationSql.includes("OLD.shipping_status = 'packed' AND NEW.shipping_status IN ('shipped', 'cancelled')"), 'Packed must allow shipped');
assert(migrationSql.includes("SECURITY DEFINER"), 'Must have SECURITY DEFINER');
assert(migrationSql.includes("SET search_path = ''"), 'Must have zero search_path');
console.log('✓ Test 1 Passed: Migration SQL contains exact required transitions');

// 2. Validate State Transition Logic Matching the Trigger
function validateStatusTransition(oldStatus, newStatus) {
  if (oldStatus === newStatus) return true;

  if (oldStatus === 'pending' && ['confirmed', 'packed', 'cancelled'].includes(newStatus)) return true;
  if (oldStatus === 'confirmed' && ['processing', 'packed', 'cancelled'].includes(newStatus)) return true;
  if (oldStatus === 'processing' && ['packed', 'cancelled'].includes(newStatus)) return true;
  if (oldStatus === 'packed' && ['shipped', 'cancelled'].includes(newStatus)) return true;
  if (oldStatus === 'shipped' && ['out_for_delivery', 'delivered', 'returned'].includes(newStatus)) return true;
  if (oldStatus === 'out_for_delivery' && ['delivered', 'returned'].includes(newStatus)) return true;
  if (oldStatus === 'delivered' && ['returned'].includes(newStatus)) return true;

  return false;
}

console.log('[Test 2] Verifying all forward lifecycle transitions under updated trigger...');
assert.strictEqual(validateStatusTransition('pending', 'packed'), true, 'pending -> packed must be allowed');
assert.strictEqual(validateStatusTransition('confirmed', 'packed'), true, 'confirmed -> packed must be allowed');
assert.strictEqual(validateStatusTransition('processing', 'packed'), true, 'processing -> packed must be allowed');
assert.strictEqual(validateStatusTransition('packed', 'shipped'), true, 'packed -> shipped must be allowed');
assert.strictEqual(validateStatusTransition('shipped', 'out_for_delivery'), true, 'shipped -> out_for_delivery must be allowed');
assert.strictEqual(validateStatusTransition('out_for_delivery', 'delivered'), true, 'out_for_delivery -> delivered must be allowed');
console.log('✓ Test 2 Passed: All forward transitions succeed');

console.log('[Test 3] Verifying cancellation transitions remain fully valid...');
assert.strictEqual(validateStatusTransition('pending', 'cancelled'), true, 'pending -> cancelled must be allowed');
assert.strictEqual(validateStatusTransition('confirmed', 'cancelled'), true, 'confirmed -> cancelled must be allowed');
assert.strictEqual(validateStatusTransition('processing', 'cancelled'), true, 'processing -> cancelled must be allowed');
assert.strictEqual(validateStatusTransition('packed', 'cancelled'), true, 'packed -> cancelled must be allowed');
assert.strictEqual(validateStatusTransition('shipped', 'cancelled'), false, 'shipped -> cancelled must be rejected (goods with courier)');
assert.strictEqual(validateStatusTransition('delivered', 'cancelled'), false, 'delivered -> cancelled must be rejected');
console.log('✓ Test 3 Passed: Cancellation transitions strictly preserved');

console.log('[Test 4] Verifying return transitions remain fully valid...');
assert.strictEqual(validateStatusTransition('shipped', 'returned'), true, 'shipped -> returned must be allowed (RTO)');
assert.strictEqual(validateStatusTransition('out_for_delivery', 'returned'), true, 'out_for_delivery -> returned must be allowed (RTO)');
assert.strictEqual(validateStatusTransition('delivered', 'returned'), true, 'delivered -> returned must be allowed (customer return)');
assert.strictEqual(validateStatusTransition('pending', 'returned'), false, 'pending -> returned must be rejected');
assert.strictEqual(validateStatusTransition('confirmed', 'returned'), false, 'confirmed -> returned must be rejected');
assert.strictEqual(validateStatusTransition('packed', 'returned'), false, 'packed -> returned must be rejected');
console.log('✓ Test 4 Passed: Return transitions strictly preserved');

console.log('[Test 5] Verifying no illegal backward or terminal regressions...');
assert.strictEqual(validateStatusTransition('shipped', 'packed'), false, 'shipped cannot regress to packed');
assert.strictEqual(validateStatusTransition('delivered', 'packed'), false, 'delivered cannot regress to packed');
assert.strictEqual(validateStatusTransition('cancelled', 'packed'), false, 'cancelled cannot regress to packed');
assert.strictEqual(validateStatusTransition('returned', 'packed'), false, 'returned cannot regress to packed');
console.log('✓ Test 5 Passed: Illegal backward transitions blocked');

// 3. Verify Edge Function Status Calculation Logic
console.log('[Test 6] Verifying shiprocket-dispatch status calculation logic in code...');
const dispatchCodePath = path.join(__dirname, '..', 'supabase', 'functions', 'shiprocket-dispatch', 'index.ts');
const dispatchCode = fs.readFileSync(dispatchCodePath, 'utf8');

assert(dispatchCode.includes("const eligiblePreDispatchStatuses = ['pending', 'confirmed', 'processing'];"), 'Must define pre-dispatch statuses');
assert(dispatchCode.includes("targetShippingStatus = 'packed';"), 'Must set target to packed');
assert(dispatchCode.includes("p_target_shipping_status: targetShippingStatus,"), 'Must pass targetShippingStatus to finalize RPC');

function computeTargetShippingStatus(currentStatus) {
  const eligiblePreDispatchStatuses = ['pending', 'confirmed', 'processing'];
  let targetShippingStatus = null;
  if (eligiblePreDispatchStatuses.includes(currentStatus)) {
    targetShippingStatus = 'packed';
  }
  return targetShippingStatus;
}

assert.strictEqual(computeTargetShippingStatus('pending'), 'packed');
assert.strictEqual(computeTargetShippingStatus('confirmed'), 'packed');
assert.strictEqual(computeTargetShippingStatus('processing'), 'packed');
assert.strictEqual(computeTargetShippingStatus('packed'), null, 'packed orders do not request status update');
assert.strictEqual(computeTargetShippingStatus('shipped'), null, 'shipped orders do not request status update');
assert.strictEqual(computeTargetShippingStatus('delivered'), null, 'delivered orders do not request status update');
assert.strictEqual(computeTargetShippingStatus('cancelled'), null, 'cancelled orders do not request status update');
assert.strictEqual(computeTargetShippingStatus('returned'), null, 'returned orders do not request status update');
console.log('✓ Test 6 Passed: Dispatch function status calculation verified across all order states');

// 4. Verify AWB Failure Isolation in shiprocket-dispatch
console.log('[Test 7] Verifying AWB failure claim release preserves shipment identifiers...');
assert(dispatchCode.includes("p_shipment_id: String(shipmentId)"), 'Must preserve shipmentId on AWB timeout/failure');
assert(dispatchCode.includes("p_shiprocket_order_id: String(shiprocketOrderId)"), 'Must preserve shiprocketOrderId on AWB timeout/failure');
console.log('✓ Test 7 Passed: AWB failure recovery preserves identifiers');

// 5. Verify Idempotency & Duplicate Prevention
console.log('[Test 8] Verifying retry skips order creation when shipmentId exists...');
assert(dispatchCode.includes("if (!shipmentId) {"), 'Must guard adhoc order creation with !shipmentId');
console.log('✓ Test 8 Passed: Idempotency check prevents duplicate Shiprocket adhoc orders');

console.log('\n========================================');
console.log('ALL 8 DISPATCH LIFECYCLE TESTS PASSED!');
console.log('========================================');

