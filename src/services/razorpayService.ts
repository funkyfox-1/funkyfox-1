// src/services/razorpayService.ts
// Official Razorpay Checkout integration helper with server-authoritative validation
// Works in coordination with Supabase Edge Functions: create-razorpay-order & verify-razorpay

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayOrderResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  razorpayOrderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  alreadyCreated?: boolean;
  error?: string;
}

export interface RazorpayVerificationResponse {
  verified: boolean;
  orderId?: string;
  orderNumber?: string;
  alreadyCaptured?: boolean;
  message?: string;
  error?: string;
}

export interface RazorpayCheckoutOptions {
  keyId: string;
  razorpayOrderId: string;
  amountPaise: number;
  currency?: string;
  name?: string;
  description?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss: () => void;
}

export class RazorpayService {
  private static scriptLoadingPromise: Promise<boolean> | null = null;

  /**
   * Loads official Razorpay Checkout script safely
   */
  static loadScript(): Promise<boolean> {
    if (typeof window === 'undefined') return Promise.resolve(false);
    if (window.Razorpay) return Promise.resolve(true);

    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise((resolve) => {
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        console.error('[RazorpayService] Failed to load Razorpay Checkout SDK from CDN.');
        resolve(false);
      };
      document.body.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  /**
   * Requests server-side Razorpay Order ID from Supabase Edge Function
   */
  static async createOrder(orderId: string): Promise<RazorpayOrderResponse> {
    const supabaseUrl = (
      import.meta.env.VITE_SUPABASE_URL ||
      'https://gcvtitcegolmkhjqqpit.supabase.co'
    ).replace(/\/+$/, '');
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/create-razorpay-order`, {
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
          error: errorJson.error || `Failed to create payment order (HTTP ${res.status})`,
        };
      }

      const data = await res.json();
      return data as RazorpayOrderResponse;
    } catch (err: any) {
      console.warn('[RazorpayService] Remote create-razorpay-order call failed:', err);
      // Fallback for test mode if edge function is in local development or offline
      return {
        success: false,
        error: err.message || 'Unable to connect to payment processing server.',
      };
    }
  }

  /**
   * Verifies payment HMAC signature and confirms capture via Supabase Edge Function
   */
  static async verifyPayment(payload: {
    order_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<RazorpayVerificationResponse> {
    const supabaseUrl = (
      import.meta.env.VITE_SUPABASE_URL ||
      'https://gcvtitcegolmkhjqqpit.supabase.co'
    ).replace(/\/+$/, '');
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/verify-razorpay`, {
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

      return data as RazorpayVerificationResponse;
    } catch (err: any) {
      console.error('[RazorpayService] Verification network error:', err);
      return {
        verified: false,
        error: err.message || 'Payment verification network error. Please contact customer support.',
      };
    }
  }

  /**
   * Launches official Razorpay standard popup
   */
  static async openCheckout(opts: RazorpayCheckoutOptions): Promise<void> {
    const isLoaded = await this.loadScript();
    if (!isLoaded || !window.Razorpay) {
      throw new Error('Unable to load Razorpay payment SDK. Please check your network connection.');
    }

    const options = {
      key: opts.keyId,
      amount: opts.amountPaise,
      currency: opts.currency || 'INR',
      name: opts.name || 'Funky Fox Clothing',
      description: opts.description || 'Apparel & Streetwear Order',
      order_id: opts.razorpayOrderId,
      prefill: {
        name: opts.customerName,
        email: opts.customerEmail,
        contact: opts.customerPhone,
      },
      theme: {
        color: '#FF6B35',
      },
      handler: (response: any) => {
        opts.onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          opts.onDismiss();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }
}

