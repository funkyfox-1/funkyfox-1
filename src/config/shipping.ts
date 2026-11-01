/**
 * @file shipping.ts
 * @description Centralized shipping configuration and calculation utilities.
 * 
 * ============================================================================
 * PROVISIONAL DEMO NOTICE FOR CLIENT & STAKEHOLDERS:
 * ============================================================================
 * The shipping values configured below (₹1,499 free shipping threshold and 
 * ₹99 standard shipping fee) are PROVISIONAL DEMO RULES used for prototyping 
 * and testing the storefront.
 * 
 * These values have NOT been confirmed as official client business policies.
 * When official client shipping terms are finalized, simply update this 
 * configuration file without needing to modify component code.
 * ============================================================================
 */

export interface ShippingPolicy {
  /** Flag identifying that this policy is provisional and subject to client confirmation */
  readonly isProvisionalDemo: boolean
  /** Minimum merchandise subtotal required for free delivery (in INR) */
  readonly freeShippingThreshold: number
  /** Standard flat delivery fee applied when subtotal is below the threshold (in INR) */
  readonly standardShippingFee: number
  /** Currency code */
  readonly currency: string
  /** Displayed delivery timeline */
  readonly deliveryTimeline: string
}

/**
 * Provisional shipping policy for demo and evaluation.
 */
export const PROVISIONAL_SHIPPING_POLICY: ShippingPolicy = {
  isProvisionalDemo: true,
  freeShippingThreshold: 1499,
  standardShippingFee: 99,
  currency: 'INR',
  deliveryTimeline: '3–5 Business Days',
} as const

export interface ShippingCalculation {
  /** The calculated shipping fee in INR (0 for free) */
  shippingFee: number
  /** Whether the order qualifies for free delivery */
  isFree: boolean
  /** Remaining subtotal needed to qualify for free shipping (0 if already free) */
  amountNeededForFree: number
  /** Display label (e.g. 'FREE' or formatted INR string) */
  displayFee: string
  /** Whether provisional notice should be communicated */
  isProvisional: boolean
}

/**
 * Calculates shipping details based on merchandise subtotal.
 * Shipping is calculated on the order subtotal, NOT per item.
 */
export function calculateShipping(
  merchandiseSubtotal: number,
  policy: ShippingPolicy = PROVISIONAL_SHIPPING_POLICY
): ShippingCalculation {
  if (merchandiseSubtotal <= 0) {
    return {
      shippingFee: 0,
      isFree: true,
      amountNeededForFree: policy.freeShippingThreshold,
      displayFee: 'FREE',
      isProvisional: policy.isProvisionalDemo,
    }
  }

  const isFree = merchandiseSubtotal >= policy.freeShippingThreshold
  const shippingFee = isFree ? 0 : policy.standardShippingFee
  const amountNeededForFree = isFree ? 0 : policy.freeShippingThreshold - merchandiseSubtotal

  return {
    shippingFee,
    isFree,
    amountNeededForFree,
    displayFee: isFree ? 'FREE' : `₹${shippingFee.toLocaleString('en-IN')}`,
    isProvisional: policy.isProvisionalDemo,
  }
}

