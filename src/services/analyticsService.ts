// src/services/analyticsService.ts
// Unified Google Analytics 4 (GA4) & Meta Pixel + Conversions API (CAPI) Tracking
// Handles eCommerce event telemetry, deterministic event deduplication, and privacy controls.

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export interface AnalyticsItem {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity?: number;
  size?: string;
  color?: string;
  sku?: string;
}

export interface AnalyticsOrder {
  id: string;
  orderNumber: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  discount?: number;
  couponCode?: string;
  items: AnalyticsItem[];
  customer?: {
    email?: string;
    phone?: string;
    name?: string;
  };
}

class AnalyticsService {
  private ga4Id: string;
  private metaPixelId: string;
  private supabaseUrl: string;
  private supabaseAnonKey: string;
  private isInitialized = false;

  constructor() {
    this.ga4Id = (import.meta.env.VITE_GA4_MEASUREMENT_ID || '').trim();
    this.metaPixelId = (import.meta.env.VITE_META_PIXEL_ID || '').trim();
    this.supabaseUrl = (
      import.meta.env.VITE_SUPABASE_URL || 'https://gcvtitcegolmkhjqqpit.supabase.co'
    ).replace(/\/+$/, '');
    this.supabaseAnonKey = (
      import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
    ).trim();
  }

  /**
   * Initializes GA4 and Meta Pixel scripts if configured
   */
  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    // 1. Initialize GA4
    if (this.ga4Id) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', this.ga4Id, {
        send_page_view: true,
        currency: 'INR',
      });

      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${this.ga4Id}`;
      document.head.appendChild(gaScript);
    }

    // 2. Initialize Meta Pixel
    if (this.metaPixelId) {
      if (!window.fbq) {
        const n: any = (window.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        });
        if (!window._fbq) window._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        const fbScript = document.createElement('script');
        fbScript.async = true;
        fbScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(fbScript);
      }
      window.fbq('init', this.metaPixelId);
      window.fbq('track', 'PageView');
    }

    this.isInitialized = true;
  }

  /**
   * Track Page View
   */
  public trackPageView(path: string, title?: string) {
    if (typeof window === 'undefined') return;

    if (this.ga4Id && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
      });
    }

    if (this.metaPixelId && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }

  /**
   * Track Product View (view_item / ViewContent)
   */
  public trackViewItem(item: AnalyticsItem) {
    if (typeof window === 'undefined') return;

    // GA4 view_item
    if (this.ga4Id && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'INR',
        value: item.price,
        items: [
          {
            item_id: item.id,
            item_name: item.name,
            item_category: item.category || 'Menswear',
            price: item.price,
            quantity: 1,
          },
        ],
      });
    }

    // Meta Pixel ViewContent
    if (this.metaPixelId && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: item.name,
        content_ids: [item.id],
        content_type: 'product',
        value: item.price,
        currency: 'INR',
      });
    }
  }

  /**
   * Track Add To Cart (add_to_cart / AddToCart)
   */
  public trackAddToCart(item: AnalyticsItem, quantity = 1) {
    if (typeof window === 'undefined') return;

    const totalValue = item.price * quantity;

    // GA4 add_to_cart
    if (this.ga4Id && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'INR',
        value: totalValue,
        items: [
          {
            item_id: item.id,
            item_name: item.name,
            item_category: item.category || 'Menswear',
            price: item.price,
            quantity,
          },
        ],
      });
    }

    // Meta Pixel AddToCart
    if (this.metaPixelId && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: item.name,
        content_ids: [item.id],
        content_type: 'product',
        value: totalValue,
        currency: 'INR',
      });
    }
  }

  /**
   * Track Begin Checkout (begin_checkout / InitiateCheckout)
   */
  public trackBeginCheckout(items: AnalyticsItem[], totalValue: number, couponCode?: string) {
    if (typeof window === 'undefined') return;

    // GA4 begin_checkout
    if (this.ga4Id && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'INR',
        value: totalValue,
        coupon: couponCode || undefined,
        items: items.map((it) => ({
          item_id: it.id,
          item_name: it.name,
          price: it.price,
          quantity: it.quantity || 1,
        })),
      });
    }

    // Meta Pixel InitiateCheckout
    if (this.metaPixelId && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: items.map((it) => it.id),
        num_items: items.reduce((acc, it) => acc + (it.quantity || 1), 0),
        value: totalValue,
        currency: 'INR',
      });
    }
  }

  /**
   * Track Purchase with Strict Deduplication (purchase / Purchase + Server CAPI)
   */
  public async trackPurchase(order: AnalyticsOrder): Promise<{ tracked: boolean; reason?: string }> {
    if (typeof window === 'undefined' || !order) {
      return { tracked: false, reason: 'No order or browser window' };
    }

    const orderRef = order.orderNumber || order.id;
    const dedupeStorageKey = `ff_tracked_purchase_${orderRef}`;

    // Prevent duplicate purchase events
    try {
      if (sessionStorage.getItem(dedupeStorageKey) || localStorage.getItem(dedupeStorageKey)) {
        return { tracked: false, reason: 'Already tracked (deduplicated)' };
      }
    } catch {
      // Storage access check
    }

    // Mark as tracked immediately in local cache
    try {
      sessionStorage.setItem(dedupeStorageKey, 'true');
      localStorage.setItem(dedupeStorageKey, 'true');
    } catch {
      // Ignore storage write error
    }

    const eventId = `order_${order.id || orderRef}`;

    // 1. GA4 Purchase Event
    if (this.ga4Id && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: orderRef,
        value: Number(order.total),
        currency: 'INR',
        shipping: Number(order.shipping || 0),
        coupon: order.couponCode || undefined,
        items: (order.items || []).map((it) => ({
          item_id: it.id,
          item_name: it.name,
          price: Number(it.price),
          quantity: it.quantity || 1,
        })),
      });
    }

    // 2. Meta Pixel Purchase (Browser side with eventID for deduplication)
    if (this.metaPixelId && window.fbq) {
      window.fbq(
        'track',
        'Purchase',
        {
          content_ids: (order.items || []).map((it) => it.id),
          content_type: 'product',
          value: Number(order.total),
          currency: 'INR',
          num_items: (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0),
        },
        { eventID: eventId }
      );
    }

    // 3. Server-side Meta Conversions API (CAPI) through Supabase Edge Function
    this.sendServerConversion({
      eventName: 'Purchase',
      eventId,
      order,
    }).catch((capiErr) => {
      console.warn('[AnalyticsService] Server CAPI dispatch noticed:', capiErr);
    });

    return { tracked: true };
  }

  /**
   * Track Refund Event
   */
  public trackRefund(transactionId: string, value: number) {
    if (typeof window === 'undefined') return;

    if (this.ga4Id && window.gtag) {
      window.gtag('event', 'refund', {
        transaction_id: transactionId,
        value,
        currency: 'INR',
      });
    }
  }

  /**
   * Server-Side Meta Conversions API dispatcher via secured Supabase Edge Function
   */
  private async sendServerConversion(params: {
    eventName: string;
    eventId: string;
    order: AnalyticsOrder;
  }) {
    if (!this.supabaseUrl || !this.supabaseAnonKey) return;

    try {
      await fetch(`${this.supabaseUrl}/functions/v1/meta-conversions-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.supabaseAnonKey,
          Authorization: `Bearer ${this.supabaseAnonKey}`,
        },
        body: JSON.stringify({
          event_name: params.eventName,
          event_id: params.eventId,
          event_time: Math.floor(Date.now() / 1000),
          order_id: params.order.id,
          order_number: params.order.orderNumber,
          total: params.order.total,
          currency: 'INR',
          customer_email: params.order.customer?.email,
          customer_phone: params.order.customer?.phone,
          items: params.order.items,
        }),
      });
    } catch (err) {
      // Non-blocking background telemetry dispatch
    }
  }
}

export const analyticsService = new AnalyticsService();

