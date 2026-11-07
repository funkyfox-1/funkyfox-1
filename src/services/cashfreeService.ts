// src/services/cashfreeService.ts
// Official Cashfree Checkout integration helper with server-authoritative validation
// Coordinates with Supabase Edge Functions: create-cashfree-order & verify-cashfree-payment

import { load } from '@cashfreepayments/cashfree-js';

export interface CashfreeOrderResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  paymentSessionId?: string;
  cfOrderId?: string | number;
  amount?: number;
  currency?: string;
  environment?: string;
  alreadyCreated?: boolean;
  error?: string;
}

export interface CashfreeVerificationResponse {
  verified: boolean;
  orderId?: string;
  orderNumber?: string;
  cfPaymentId?: string;
  alreadyCaptured?: boolean;
  message?: string;
  error?: string;
}

export interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  environment?: 'sandbox' | 'production';
  redirectTarget?: '_modal' | '_self';
  onDismiss?: () => void;
}

export class CashfreeService {
  private static sdkPromise: Promise<any> | null = null;
  private static cachedMode: string | null = null;

  /**
   * Loads and caches the official Cashfree JS SDK instance
   */
  static async getCashfreeInstance(environment: 'sandbox' | 'production' = 'sandbox'): Promise<any> {
    const targetMode = environment === 'production' ? 'production' : 'sandbox';

    if (this.sdkPromise && this.cachedMode === targetMode) {
      return this.sdkPromise;
    }

    this.cachedMode = targetMode;
    this.sdkPromise = (async () => {
      try {
        const cashfree = await load({
          mode: targetMode,
        });
        return cashfree;
      } catch (err) {
        console.error('[CashfreeService] Failed to initialize Cashfree SDK:', err);
        this.sdkPromise = null;
        return null;
      }
    })();

    return this.sdkPromise;
  }

  /**
   * Requests server-side Cashfree Order ID and paymentSessionId from Supabase Edge Function
   */
  static async createOrder(orderId: string): Promise<CashfreeOrderResponse> {
    const supabaseUrl = (
      import.meta.env.VITE_SUPABASE_URL ||
      'https://gcvtitcegolmkhjqqpit.supabase.co'
    ).replace(/\/+$/, '');
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/create-cashfree-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ order_id: orderId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorJson: any;
        try {
          errorJson = JSON.parse(errorText);
        } catch {
          errorJson = { error: errorText };
        }
        return {
          success: false,
          error: errorJson.error || `Failed to create Cashfree order (HTTP ${res.status})`,
        };
      }

      const data = await res.json();
      return data as CashfreeOrderResponse;
    } catch (err: any) {
      console.warn('[CashfreeService] Remote create-cashfree-order call failed:', err);
      return {
        success: false,
        error: err.message || 'Unable to connect to Cashfree payment processing server.',
      };
    }
  }

  /**
   * Verifies payment status directly via Supabase Edge Function
   */
  static async verifyPayment(payload: {
    order_id: string;
    cf_order_id?: string | number;
    cf_payment_id?: string;
  }): Promise<CashfreeVerificationResponse> {
    const supabaseUrl = (
      import.meta.env.VITE_SUPABASE_URL ||
      'https://gcvtitcegolmkhjqqpit.supabase.co'
    ).replace(/\/+$/, '');
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/verify-cashfree-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.verified) {
        return {
          verified: false,
          error: data.error || `Payment verification failed (HTTP ${res.status})`,
        };
      }

      return data as CashfreeVerificationResponse;
    } catch (err: any) {
      console.error('[CashfreeService] Verification network error:', err);
      return {
        verified: false,
        error: err.message || 'Payment verification network error. Please contact customer support.',
      };
    }
  }

  /**
   * Launches official Cashfree checkout modal or redirect
   */
  static async openCheckout(options: CashfreeCheckoutOptions): Promise<any> {
    const { paymentSessionId, environment = 'sandbox', redirectTarget = '_modal', onDismiss } = options;

    const cashfree = await this.getCashfreeInstance(environment);
    if (!cashfree) {
      throw new Error('Unable to initialize Cashfree payment SDK. Please verify your connection.');
    }

    try {
      const result = await cashfree.checkout({
        paymentSessionId,
        redirectTarget,
      });

      if (result?.error) {
        if (onDismiss) onDismiss();
        return result;
      }

      return result;
    } catch (err) {
      console.error('[CashfreeService] Checkout exception:', err);
      if (onDismiss) onDismiss();
      throw err;
    }
  }
}

