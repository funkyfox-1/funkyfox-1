/**
 * Funky Fox API & Service Contracts
 * 
 * NOTE FOR BACKEND DEVELOPERS:
 * This module defines the complete frontend data contracts and service interfaces.
 * When integrating real APIs (REST/GraphQL), replace the mock implementations inside
 * these functions with your actual endpoint calls (e.g. via axios or fetch) without
 * having to modify UI components.
 */

import { Product, products } from '../data/products';
import { Order } from '../data/accountMockData';

// ==========================================
// 1. DELIVERY & PINCODE TYPES & SERVICES
// ==========================================

export interface PincodeDeliveryResult {
  pincode: string;
  isDeliverable: boolean;
  city: string;
  state: string;
  estimatedDays: number;
  estimatedDate: string;
  expressAvailable: boolean;
  codAvailable: boolean;
  hubLocation: string;
  hubCoordinates: { lat: number; lng: number };
  message: string;
}

export const DeliveryService = {
  /**
   * Verify delivery availability, timelines, and payment options for an Indian pincode.
   * Linked to customer flagship hub at 16.5168591, 80.628406 (Vijayawada Depot).
   */
  async checkPincode(pincode: string): Promise<PincodeDeliveryResult> {
    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const cleanPin = pincode.trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      throw new Error('Please enter a valid 6-digit Indian PIN code.');
    }

    // Flagship / Customer Hub Region (Vijayawada / Krishna District - 520xxx)
    if (cleanPin.startsWith('520') || cleanPin.startsWith('521')) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 2);
      const dateStr = targetDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

      return {
        pincode: cleanPin,
        isDeliverable: true,
        city: 'Vijayawada',
        state: 'Andhra Pradesh',
        estimatedDays: 2,
        estimatedDate: dateStr,
        expressAvailable: true,
        codAvailable: true,
        hubLocation: 'Vijayawada Flagship Hub (16.5168° N, 80.6284° E)',
        hubCoordinates: { lat: 16.5168591, lng: 80.628406 },
        message: 'Direct dispatch from our regional express depot.',
      };
    }

    // Pan-India General Pincodes
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 4);
    const dateStr = targetDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

    return {
      pincode: cleanPin,
      isDeliverable: true,
      city: 'India Destination',
      state: 'Verified Pin Code',
      estimatedDays: 4,
      estimatedDate: dateStr,
      expressAvailable: true,
      codAvailable: true,
      hubLocation: 'Dispatched via BlueDart / Delhivery Express',
      hubCoordinates: { lat: 16.5168591, lng: 80.628406 },
      message: 'Insured pan-India express doorstep delivery.',
    };
  },
};

// ==========================================
// 2. COUPON / PROMO CODE ENGINE
// ==========================================

export interface CouponValidationResult {
  code: string;
  valid: boolean;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountAmount: number;
  description: string;
  minOrder?: number;
}

export const CouponService = {
  /**
   * Validate a promotional coupon and compute discount for a given cart subtotal.
   */
  async applyCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const upperCode = code.trim().toUpperCase();

    if (upperCode === 'FOX10') {
      const discount = Math.round(subtotal * 0.1);
      return {
        code: 'FOX10',
        valid: true,
        discountType: 'percentage',
        discountAmount: discount,
        description: '10% discount applied to your order',
      };
    }

    if (upperCode === 'FIRSTDROP') {
      if (subtotal < 999) {
        throw new Error('FIRSTDROP coupon requires a minimum subtotal of ₹999.');
      }
      return {
        code: 'FIRSTDROP',
        valid: true,
        discountType: 'fixed',
        discountAmount: 200,
        description: '₹200 flat discount applied on your order',
        minOrder: 999,
      };
    }

    if (upperCode === 'FREESHIP') {
      return {
        code: 'FREESHIP',
        valid: true,
        discountType: 'free_shipping',
        discountAmount: 99,
        description: 'Free pan-India delivery waived on this order',
      };
    }

    throw new Error('Invalid coupon code. Try FOX10, FIRSTDROP, or FREESHIP.');
  },
};

// ==========================================
// 3. RETURN & EXCHANGE SERVICES
// ==========================================

export interface ReturnExchangeRequest {
  orderId: string;
  requestType: 'exchange' | 'refund';
  itemIds: string[];
  reason: string;
  newSize?: string;
  notes?: string;
  pickupAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    mapsUrl?: string;
  };
}

export interface ReturnExchangeResponse {
  success: boolean;
  rmaId: string;
  pickupDate: string;
  status: string;
  message: string;
}

export const OrderService = {
  /**
   * Submit a risk-free 15-day return or exchange request.
   */
  async requestReturnOrExchange(req: ReturnExchangeRequest): Promise<ReturnExchangeResponse> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const rma = 'RMA-FF-' + Math.floor(100000 + Math.random() * 900000);
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 1);

    return {
      success: true,
      rmaId: rma,
      pickupDate: pickupDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      status: 'Pickup Scheduled',
      message:
        req.requestType === 'exchange'
          ? `Exchange request ${rma} confirmed. Our courier partner will collect the piece from your doorstep for replacement.`
          : `Return request ${rma} verified. Refund will be processed immediately upon doorstep pickup inspection.`,
    };
  },
};

