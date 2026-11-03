import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  AdminProduct,
  ProductVariant,
  AdminCategory,
  AdminOrder,
  AdminCustomer,
  AdminCoupon,
  HomepageBanner,
  MediaItem,
  InventoryLog,
  AuditLog,
  StoreSettings,
} from '../lib/types';

/**
 * Enterprise Supabase Database Service
 * Directly interacts with Supabase PostgreSQL tables defined in supabase/schema.sql
 * Protected by Row-Level Security (RLS) policies.
 */
export class SupabaseDbService {
  // --- ADMIN USERS (RBAC) ---
  static async fetchAdminUsers(): Promise<any[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, auth_user_id, email, name, role, avatar, created_at, last_login')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[SupabaseDb] Error fetching admin users:', error);
      return [];
    }

    return (data || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      avatar: u.avatar,
      createdAt: u.created_at,
      lastLogin: u.last_login,
    }));
  }

  static async assignAdminRole(email: string, role: string, name: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Database backend not configured.' };
    }
    const { error } = await supabase.from('admin_users').upsert(
      {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role: role,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  // --- PRODUCTS ---
  static async fetchProducts(): Promise<AdminProduct[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    const { data: productsData, error: prodError } = await supabase
      .from('products')
      .select('*, product_variants(*)');

    if (prodError) {
      console.error('[SupabaseDb] Error fetching products:', prodError);
      throw prodError;
    }

    return (productsData || []).map((p: any) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      sku: p.sku,
      shortDescription: p.short_description,
      description: p.description,
      details: p.details || [],
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      costPrice: p.cost_price ? Number(p.cost_price) : undefined,
      taxRate: p.tax_rate ? Number(p.tax_rate) : 18,
      category: p.category,
      subcategory: p.subcategory,
      brand: p.brand || 'Funky Fox',
      tags: p.tags || [],
      image: p.image,
      images: p.images || [],
      alt: p.alt,
      status: p.status,
      isNew: p.is_new,
      isBestseller: p.is_bestseller,
      featuredOrder: p.featured_order,
      totalStock: p.total_stock,
      lowStockThreshold: p.low_stock_threshold,
      allowBackorders: p.allow_backorders,
      seoTitle: p.seo_title,
      seoDescription: p.seo_description,
      seoImage: p.seo_image,
      variants: (p.product_variants || []).map((v: any) => ({
        id: v.id,
        productId: v.product_id,
        size: v.size,
        colorName: v.color_name,
        colorHex: v.color_hex,
        sku: v.sku,
        stock: v.stock,
        price: v.price ? Number(v.price) : undefined,
        inStock: v.in_stock,
      })),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  }

  static async upsertProduct(product: AdminProduct): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Upsert parent product record
    const { error: prodError } = await supabase.from('products').upsert({
      id: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      short_description: product.shortDescription,
      description: product.description,
      details: product.details,
      price: product.price,
      original_price: product.originalPrice,
      cost_price: product.costPrice,
      tax_rate: product.taxRate || 18,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      tags: product.tags,
      image: product.image,
      images: product.images,
      alt: product.alt,
      status: product.status,
      is_new: product.isNew,
      is_bestseller: product.isBestseller,
      featured_order: product.featuredOrder,
      total_stock: product.totalStock,
      low_stock_threshold: product.lowStockThreshold,
      allow_backorders: product.allowBackorders,
      seo_title: product.seoTitle,
      seo_description: product.seoDescription,
      seo_image: product.seoImage,
      updated_at: new Date().toISOString(),
    });

    if (prodError) {
      console.error('[SupabaseDb] Upsert product failed:', prodError);
      throw prodError;
    }

    // 2. Upsert child product_variants
    if (product.variants && product.variants.length > 0) {
      const variantRecords = product.variants.map((v) => ({
        id: v.id,
        product_id: product.id,
        size: v.size,
        color_name: v.colorName,
        color_hex: v.colorHex,
        sku: v.sku,
        stock: v.stock,
        price: v.price,
        in_stock: v.inStock,
      }));

      const { error: varError } = await supabase
        .from('product_variants')
        .upsert(variantRecords, { onConflict: 'id' });

      if (varError) {
        console.error('[SupabaseDb] Upsert variants failed:', varError);
        throw varError;
      }
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('[SupabaseDb] Delete product failed:', error);
      throw error;
    }
  }

  // --- CATEGORIES ---
  static async fetchCategories(): Promise<AdminCategory[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      isVisible: c.is_visible,
      order: c.display_order,
    }));
  }

  static async upsertCategory(cat: AdminCategory): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase.from('categories').upsert({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      is_visible: cat.isVisible,
      display_order: cat.order,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }

  static async deleteCategory(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  }

  // --- CUSTOMERS ---
  static async fetchCustomers(): Promise<AdminCustomer[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      addresses: c.addresses || [],
      totalOrders: c.total_orders || 0,
      totalSpent: Number(c.total_spent) || 0,
      lastOrderDate: c.last_order_date,
      notes: c.notes,
      createdAt: c.created_at,
    }));
  }

  static async upsertCustomer(customer: AdminCustomer): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('customers').upsert({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      addresses: customer.addresses,
      total_orders: customer.totalOrders,
      total_spent: customer.totalSpent,
      last_order_date: customer.lastOrderDate,
      notes: customer.notes,
    });
    if (error) throw error;
  }

  // --- COUPONS ---
  static async fetchCoupons(): Promise<AdminCoupon[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((cp: any) => ({
      id: cp.id,
      code: cp.code,
      description: cp.description || '',
      discountType: cp.discount_type,
      discountValue: Number(cp.discount_value),
      minPurchaseAmount: cp.min_purchase_amount ? Number(cp.min_purchase_amount) : 0,
      maxDiscountAmount: cp.max_discount_amount ? Number(cp.max_discount_amount) : undefined,
      startDate: cp.start_date,
      endDate: cp.end_date,
      usageLimit: cp.usage_limit,
      usageCount: cp.usage_count || 0,
      perCustomerLimit: cp.per_customer_limit || 1,
      isActive: cp.is_active,
    }));
  }

  static async upsertCoupon(coupon: AdminCoupon): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('coupons').upsert({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discountType,
      discount_value: coupon.discountValue,
      min_purchase_amount: coupon.minPurchaseAmount || 0,
      max_discount_amount: coupon.maxDiscountAmount,
      start_date: coupon.startDate,
      end_date: coupon.endDate,
      usage_limit: coupon.usageLimit,
      usage_count: coupon.usageCount,
      per_customer_limit: coupon.perCustomerLimit,
      is_active: coupon.isActive,
    });
    if (error) throw error;
  }

  static async deleteCoupon(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
  }

  // --- BANNERS ---
  static async fetchBanners(): Promise<HomepageBanner[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase.from('banners').select('*').order('display_order', { ascending: true });
    if (error) throw error;
    return (data || []).map((b: any) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      imageUrl: b.image_url,
      mobileImageUrl: b.mobile_image_url,
      ctaText: b.cta_text,
      ctaLink: b.cta_link,
      badge: b.badge,
      position: b.position,
      order: b.display_order,
      isActive: b.is_active,
      startDate: b.start_date,
      endDate: b.end_date,
    }));
  }

  static async upsertBanner(banner: HomepageBanner): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('banners').upsert({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      image_url: banner.imageUrl,
      mobile_image_url: banner.mobileImageUrl,
      cta_text: banner.ctaText,
      cta_link: banner.ctaLink,
      badge: banner.badge,
      position: banner.position,
      display_order: banner.order,
      is_active: banner.isActive,
      start_date: banner.startDate,
      end_date: banner.endDate,
    });
    if (error) throw error;
  }

  static async deleteBanner(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) throw error;
  }

  // --- MEDIA ITEMS ---
  static async fetchMediaItems(): Promise<MediaItem[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase.from('media_items').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      url: m.url,
      size: Number(m.size),
      mimeType: m.mime_type,
      dimensions: m.dimensions,
      usedIn: m.used_in || [],
      createdAt: m.created_at,
    }));
  }

  static async saveMediaItem(item: MediaItem): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('media_items').upsert({
      id: item.id,
      name: item.name,
      url: item.url,
      size: item.size,
      mime_type: item.mimeType,
      dimensions: item.dimensions,
      used_in: item.usedIn,
    });
    if (error) throw error;
  }

  static async deleteMediaItem(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('media_items').delete().eq('id', id);
    if (error) throw error;
  }

  // --- STORE SETTINGS ---
  static async fetchStoreSettings(): Promise<StoreSettings | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('store_settings').select('settings').eq('id', 'default').maybeSingle();
    if (error) throw error;
    return data?.settings || null;
  }

  static async updateStoreSettings(settings: StoreSettings): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('store_settings').upsert({
      id: 'default',
      settings,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }

  // --- INVENTORY LOGS ---
  static async fetchInventoryLogs(): Promise<InventoryLog[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase.from('inventory_logs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((l: any) => ({
      id: l.id,
      productId: l.product_id,
      productName: l.product_name,
      sku: l.sku,
      variantId: l.variant_id,
      variantLabel: l.variant_label,
      previousQuantity: l.previous_quantity,
      newQuantity: l.new_quantity,
      change: l.change,
      reason: l.reason,
      note: l.note,
      adminName: l.admin_name,
      createdAt: l.created_at,
    }));
  }

  // --- AUDIT LOGS ---
  static async fetchAuditLogs(): Promise<AuditLog[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((a: any) => ({
      id: a.id,
      adminName: a.admin_name,
      action: a.action,
      resourceType: a.resource_type,
      resourceId: a.resource_id,
      details: a.details,
      timestamp: a.created_at,
    }));
  }

  // --- ORDERS ---
  static async fetchOrders(): Promise<AdminOrder[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((o: any) => ({
      id: o.id,
      orderNumber: o.order_number,
      customer: o.customer_info,
      shippingAddress: o.shipping_address,
      items: (o.order_items || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image,
        sku: item.sku,
      })),
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      couponCode: o.coupon_code,
      shippingCharge: Number(o.shipping_charge),
      tax: Number(o.tax),
      total: Number(o.total),
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      paymentDetails: o.payment_details,
      fulfillmentStatus: o.fulfillment_status,
      shippingStatus: o.shipping_status,
      shipmentDetails: o.shipment_details,
      timeline: o.timeline || [],
      internalNotes: o.internal_notes || [],
      createdAt: o.created_at,
      updatedAt: o.updated_at,
    }));
  }

  static async fetchOrderById(orderId: string): Promise<AdminOrder | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    const { data: o, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .maybeSingle();

    if (error || !o) return null;

    return {
      id: o.id,
      orderNumber: o.order_number,
      customer: o.customer_info,
      shippingAddress: o.shipping_address,
      items: (o.order_items || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image,
        sku: item.sku,
      })),
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      couponCode: o.coupon_code,
      shippingCharge: Number(o.shipping_charge),
      tax: Number(o.tax),
      total: Number(o.total),
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      paymentDetails: o.payment_details,
      fulfillmentStatus: o.fulfillment_status,
      shippingStatus: o.shipping_status,
      shipmentDetails: o.shipment_details,
      timeline: o.timeline || [],
      internalNotes: o.internal_notes || [],
      createdAt: o.created_at,
      updatedAt: o.updated_at,
    };
  }

  static async dispatchShiprocketShipment(orderId: string): Promise<{
    success: boolean;
    message?: string;
    already_dispatched?: boolean;
    shipment_id?: string;
    shiprocket_order_id?: string;
    awb_code?: string;
    courier_name?: string;
    tracking_url?: string;
    shipping_status?: string;
    fulfillment_status?: string;
  }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const { data, error } = await supabase.functions.invoke('shiprocket-dispatch', {
      body: { order_id: orderId },
    });

    if (error) {
      let message = error.message;
      if ((error as any).context && typeof (error as any).context.json === 'function') {
        try {
          const body = await (error as any).context.json();
          message = body?.error || body?.message || message;
        } catch {
          // ignore parsing error
        }
      }
      throw new Error(message || 'Failed to dispatch shipment with Shiprocket');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  }

  static async trackShiprocketShipment(orderId: string, awbCode?: string): Promise<{
    success: boolean;
    order_id?: string;
    awb_code?: string;
    courier_name?: string;
    current_status?: string;
    shipping_status?: string;
    status_updated?: boolean;
    etd?: string | null;
    tracking_url?: string;
    activities?: Array<{
      date: string;
      status: string;
      activity: string;
      location?: string;
      raw_label?: string;
    }>;
    last_tracked_at?: string;
  }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const { data, error } = await supabase.functions.invoke('shiprocket-track', {
      body: { order_id: orderId, awb_code: awbCode },
    });

    if (error) {
      let message = error.message;
      if ((error as any).context && typeof (error as any).context.json === 'function') {
        try {
          const body = await (error as any).context.json();
          message = body?.error || body?.message || message;
        } catch {
          // ignore parsing error
        }
      }
      throw new Error(message || 'Failed to retrieve tracking from Shiprocket');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  }

  static async createCustomerOrder(orderPayload: {
    idempotencyKey?: string;
    id?: string;
    orderNumber?: string;
    customer: {
      id?: string;
      name: string;
      email: string;
      phone: string;
    };
    shippingAddress: any;
    items: Array<{
      productId?: string;
      id?: string;
      name?: string;
      price?: number;
      quantity: number;
      size: string;
      color: string;
      image?: string;
      sku?: string;
    }>;
    subtotal?: number;
    discount?: number;
    couponCode?: string;
    shippingCharge?: number;
    tax?: number;
    total?: number;
    paymentMethod?: string;
  }): Promise<{
    success: boolean;
    orderId: string;
    orderNumber: string;
    total: number;
    subtotal: number;
    discount: number;
    shippingCharge: number;
    tax: number;
    alreadyExists?: boolean;
  }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const payload = {
      idempotencyKey: orderPayload.idempotencyKey,
      customer: {
        name: orderPayload.customer.name,
        email: orderPayload.customer.email,
        phone: orderPayload.customer.phone,
      },
      shippingAddress: orderPayload.shippingAddress,
      items: orderPayload.items.map((it) => ({
        productId: it.productId || it.id,
        name: it.name,
        quantity: it.quantity,
        size: it.size,
        color: it.color,
        image: it.image,
      })),
      couponCode: orderPayload.couponCode,
      paymentMethod: orderPayload.paymentMethod || 'cod',
    };

    const { data, error } = await supabase.rpc('create_customer_order', { payload });

    if (error) {
      console.error('[SupabaseDbService] create_customer_order RPC error:', error);
      throw new Error(error.message || 'Database error processing order.');
    }

    if (!data || !data.success) {
      throw new Error((data && (data as any).message) || 'Order creation rejected by server.');
    }

    return data as any;
  }

  static async createOrder(order: AdminOrder): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await this.createCustomerOrder({
      idempotencyKey: order.id,
      customer: order.customer,
      shippingAddress: order.shippingAddress,
      items: order.items.map((it) => ({
        productId: it.productId,
        name: it.name,
        quantity: it.quantity,
        size: it.size,
        color: it.color,
        image: it.image,
      })),
      couponCode: order.couponCode,
      paymentMethod: order.paymentMethod,
    });
  }

  static async updateOrderStatus(
    orderId: string,
    status: AdminOrder['shippingStatus'],
    timeline: any[]
  ): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase
      .from('orders')
      .update({
        shipping_status: status,
        timeline,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) throw error;
  }

  // --- INVENTORY AUDIT LOGS ---
  static async logInventory(log: Omit<InventoryLog, 'id' | 'createdAt'>): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase.from('inventory_logs').insert({
      product_id: log.productId,
      product_name: log.productName,
      sku: log.sku,
      variant_id: log.variantId,
      variant_label: log.variantLabel,
      previous_quantity: log.previousQuantity,
      new_quantity: log.newQuantity,
      change: log.change,
      reason: log.reason,
      note: log.note,
      admin_name: log.adminName,
    });
    if (error) console.error('[SupabaseDb] Log inventory failed:', error);
  }

  // --- AUDIT LOGS ---
  static async logAudit(
    adminName: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: string
  ): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase.from('audit_logs').insert({
      admin_name: adminName,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
    });
    if (error) console.error('[SupabaseDb] Log audit failed:', error);
  }

  // --- STORAGE UPLOAD ---
  static async uploadProductImage(file: File): Promise<string> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase Storage is unconfigured.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[SupabaseStorage] Image upload failed:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    if (!data?.publicUrl) {
      throw new Error('Failed to retrieve public CDN URL for uploaded asset.');
    }

    return data.publicUrl;
  }
}
