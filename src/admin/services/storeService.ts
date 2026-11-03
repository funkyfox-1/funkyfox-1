import { products as baseProducts, categories as baseCategories } from '../../data/products';
import {
  AdminProduct,
  AdminCategory,
  AdminOrder,
  AdminCustomer,
  AdminCoupon,
  HomepageBanner,
  MediaItem,
  InventoryLog,
  AuditLog,
  StoreSettings,
  ProductVariant,
} from '../lib/types';
import { isSupabaseConfigured } from '../lib/supabase';
import { SupabaseDbService } from './supabaseDbService';

const STORAGE_PREFIX = 'funkyfox_admin_';

function seedAdminProducts(): AdminProduct[] {
  return baseProducts.map((p, index) => {
    const variants: ProductVariant[] = [];
    const sizes = p.sizes || ['S', 'M', 'L', 'XL'];
    const colors = p.colors || [{ name: 'Standard', value: '#171717' }];

    colors.forEach((col) => {
      sizes.forEach((sz) => {
        variants.push({
          id: `${p.id}-${col.name.toLowerCase().replace(/\s+/g, '-')}-${sz.toLowerCase()}`,
          productId: p.id,
          size: sz,
          colorName: col.name,
          colorHex: col.value,
          sku: `FF-${p.id.substring(0, 4).toUpperCase()}-${col.name.substring(0, 2).toUpperCase()}-${sz}`,
          stock: Math.floor(Math.random() * 8) + 2,
          price: p.price,
          inStock: true,
        });
      });
    });

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    return {
      id: p.id,
      slug: p.id,
      name: p.name,
      sku: `FF-${p.id.substring(0, 6).toUpperCase()}-001`,
      shortDescription: p.description?.substring(0, 100) || `${p.name} crafted for effortless everyday style.`,
      description: p.description || `${p.name} — Premium quality materials, designed for durability and comfort.`,
      details: p.details || ['100% Breathable fabric', 'Durable tailored stitching', 'Machine wash cold'],
      price: p.price,
      originalPrice: p.originalPrice || Math.round(p.price * 1.3),
      costPrice: Math.round(p.price * 0.45),
      taxRate: 18,
      category: p.category,
      brand: 'Funky Fox',
      tags: ['everyday', p.category.toLowerCase(), p.isNew ? 'new-arrival' : '', p.isBestseller ? 'bestseller' : ''].filter(Boolean),
      image: p.image,
      images: p.images && p.images.length > 0 ? p.images : [p.image],
      alt: p.alt || p.name,
      status: p.inStock ? 'active' : 'active',
      isNew: p.isNew || false,
      isBestseller: p.isBestseller || false,
      featuredOrder: p.featuredOrder || index + 1,
      totalStock: totalStock || 15,
      lowStockThreshold: 5,
      allowBackorders: false,
      variants,
      seoTitle: `${p.name} | Funky Fox Official`,
      seoDescription: p.description || `Buy ${p.name} online at Funky Fox. Free shipping across India.`,
      createdAt: new Date(Date.now() - (index * 86400000 * 2)).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

function seedAdminCategories(): AdminCategory[] {
  const images = [
    '/images/category-tshirts.jpg',
    '/images/category-shirts.jpg',
    '/images/category-trousers.jpg',
    '/images/category-jackets.jpg',
  ];
  return baseCategories.map((cat, idx) => ({
    id: cat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: cat,
    slug: cat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: `Curated collection of Funky Fox ${cat.toLowerCase()} built for urban comfort.`,
    image: images[idx] || '/images/category-tshirts.jpg',
    isVisible: true,
    order: idx + 1,
    productCount: baseProducts.filter((p) => p.category === cat).length,
  }));
}

function seedAdminOrders(): AdminOrder[] {
  return [];
}

function seedAdminCustomers(): AdminCustomer[] {
  return [];
}

function seedAdminCoupons(): AdminCoupon[] {
  return [
    {
      id: 'coup-1',
      code: 'WELCOME10',
      description: '10% off for first-time shoppers',
      discountType: 'percentage',
      discountValue: 10,
      minPurchaseAmount: 999,
      maxDiscountAmount: 300,
      startDate: new Date(Date.now() - 86400000 * 30).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 180).toISOString(),
      usageLimit: 500,
      usageCount: 42,
      perCustomerLimit: 1,
      isActive: true,
    },
  ];
}

function seedAdminBanners(): HomepageBanner[] {
  return [
    {
      id: 'ban-1',
      title: 'Summer 2026 Editorial Drop',
      subtitle: 'Heavyweight organic cottons, relaxed tailoring, and daily silhouettes.',
      imageUrl: '/images/editorial-campaign.webp',
      mobileImageUrl: '/images/editorial-campaign-small.webp',
      ctaText: 'Explore New Arrivals',
      ctaLink: '/products?sort=newest',
      badge: 'New Season',
      position: 'hero',
      order: 1,
      isActive: true,
    },
  ];
}

function seedMediaLibrary(): MediaItem[] {
  return [
    {
      id: 'med-1',
      name: 'editorial-campaign.webp',
      url: '/images/editorial-campaign.webp',
      size: 320008,
      mimeType: 'image/webp',
      dimensions: { width: 1920, height: 1080 },
      usedIn: ['Homepage Hero Banner'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'med-2',
      name: 'category-tshirts.jpg',
      url: '/images/category-tshirts.jpg',
      size: 179186,
      mimeType: 'image/jpeg',
      dimensions: { width: 800, height: 1000 },
      usedIn: ['Category: T-Shirts', 'Essential Cotton T-Shirt'],
      createdAt: new Date().toISOString(),
    },
  ];
}

function seedStoreSettings(): StoreSettings {
  return {
    storeName: 'Funky Fox Clothing Co.',
    storeTagline: 'Modern Streetwear & Daily Essentials',
    storeLogoUrl: '/favicon.svg',
    supportEmail: 'care@funkyfox.in',
    supportPhone: '+91 98200 55443',
    address: 'Warehouse #7, Apex Industrial Estate, Andheri East, Mumbai 400093, India',
    currency: 'INR',
    taxGstRate: 18,
    freeShippingThreshold: 1499,
    standardShippingFee: 99,
    returnWindowDays: 7,
    policies: {
      returnPolicy: 'Hassle-free 7-day pickup and full exchange or refund on unwashed items with tags attached.',
      privacyPolicy: 'We respect your privacy. Customer details and contact information are strictly protected.',
      termsAndConditions: 'All orders processed under Indian consumer protection regulations and ecommerce laws.',
    },
    apiKeys: {},
  };
}

class StoreService {
  private products: AdminProduct[] = [];
  private categories: AdminCategory[] = [];
  private orders: AdminOrder[] = [];
  private customers: AdminCustomer[] = [];
  private coupons: AdminCoupon[] = [];
  private banners: HomepageBanner[] = [];
  private mediaItems: MediaItem[] = [];
  private inventoryLogs: InventoryLog[] = [];
  private auditLogs: AuditLog[] = [];
  private settings: StoreSettings = seedStoreSettings();
  private initialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.initialized) return;

    try {
      const storedProducts = localStorage.getItem(`${STORAGE_PREFIX}products`);
      this.products = storedProducts ? JSON.parse(storedProducts) : seedAdminProducts();

      const storedCategories = localStorage.getItem(`${STORAGE_PREFIX}categories`);
      this.categories = storedCategories ? JSON.parse(storedCategories) : seedAdminCategories();

      const storedOrders = localStorage.getItem(`${STORAGE_PREFIX}orders`);
      const parsedOrders: AdminOrder[] = storedOrders ? JSON.parse(storedOrders) : [];
      // Cleanse any legacy placeholder demo orders
      this.orders = parsedOrders.filter((o) => !o.id.startsWith('ord-ff-902'));

      const storedCustomers = localStorage.getItem(`${STORAGE_PREFIX}customers`);
      const parsedCustomers: AdminCustomer[] = storedCustomers ? JSON.parse(storedCustomers) : [];
      // Cleanse any legacy placeholder demo customers
      this.customers = parsedCustomers.filter((c) => !c.id.startsWith('cust-1') && !c.id.startsWith('cust-2'));

      const storedCoupons = localStorage.getItem(`${STORAGE_PREFIX}coupons`);
      this.coupons = storedCoupons ? JSON.parse(storedCoupons) : seedAdminCoupons();

      const storedBanners = localStorage.getItem(`${STORAGE_PREFIX}banners`);
      this.banners = storedBanners ? JSON.parse(storedBanners) : seedAdminBanners();

      const storedMedia = localStorage.getItem(`${STORAGE_PREFIX}media`);
      this.mediaItems = storedMedia ? JSON.parse(storedMedia) : seedMediaLibrary();

      const storedLogs = localStorage.getItem(`${STORAGE_PREFIX}inventory_logs`);
      this.inventoryLogs = storedLogs ? JSON.parse(storedLogs) : [];

      const storedAudits = localStorage.getItem(`${STORAGE_PREFIX}audit_logs`);
      this.auditLogs = storedAudits ? JSON.parse(storedAudits) : [];

      const storedSettings = localStorage.getItem(`${STORAGE_PREFIX}settings`);
      if (storedSettings) this.settings = JSON.parse(storedSettings);

      this.syncStorefrontProducts();

      // If Supabase is live, fetch authoritative cloud records
      if (isSupabaseConfigured) {
        this.syncFromSupabase().catch((e) =>
          console.warn('[StoreService] Supabase initial sync notice:', e)
        );
      }

      this.initialized = true;
    } catch (e) {
      console.warn('[StoreService] Local cache init warning:', e);
      this.products = seedAdminProducts();
      this.categories = seedAdminCategories();
      this.orders = [];
      this.customers = [];
      this.coupons = seedAdminCoupons();
      this.banners = seedAdminBanners();
      this.mediaItems = seedMediaLibrary();
      this.settings = seedStoreSettings();
      this.syncStorefrontProducts();
    }
  }

  async syncFromSupabase() {
    if (!isSupabaseConfigured) return;
    try {
      const cloudProds = await SupabaseDbService.fetchProducts();
      if (cloudProds.length > 0) {
        this.products = cloudProds;
        this.persist('products', this.products);
        this.syncStorefrontProducts();
      }

      const cloudCats = await SupabaseDbService.fetchCategories();
      if (cloudCats.length > 0) {
        this.categories = cloudCats;
        this.persist('categories', this.categories);
      }

      // Live authoritative orders (empty array if no orders exist yet in database)
      const cloudOrders = await SupabaseDbService.fetchOrders();
      this.orders = (cloudOrders || []).filter((o) => !o.id.startsWith('ord-ff-902'));
      this.persist('orders', this.orders);

      // Live authoritative customers
      const cloudCustomers = await SupabaseDbService.fetchCustomers();
      this.customers = (cloudCustomers || []).filter((c) => !c.id.startsWith('cust-1') && !c.id.startsWith('cust-2'));
      this.persist('customers', this.customers);

      const cloudCoupons = await SupabaseDbService.fetchCoupons();
      if (cloudCoupons.length > 0) {
        this.coupons = cloudCoupons;
        this.persist('coupons', this.coupons);
      }

      const cloudBanners = await SupabaseDbService.fetchBanners();
      if (cloudBanners.length > 0) {
        this.banners = cloudBanners;
        this.persist('banners', this.banners);
      }

      const cloudMedia = await SupabaseDbService.fetchMediaItems();
      if (cloudMedia.length > 0) {
        this.mediaItems = cloudMedia;
        this.persist('media', this.mediaItems);
      }

      const cloudSettings = await SupabaseDbService.fetchStoreSettings();
      if (cloudSettings) {
        this.settings = cloudSettings;
        this.persist('settings', this.settings);
      }

      const cloudLogs = await SupabaseDbService.fetchInventoryLogs();
      if (cloudLogs.length > 0) {
        this.inventoryLogs = cloudLogs;
        this.persist('inventory_logs', this.inventoryLogs);
      }

      const cloudAudits = await SupabaseDbService.fetchAuditLogs();
      if (cloudAudits.length > 0) {
        this.auditLogs = cloudAudits;
        this.persist('audit_logs', this.auditLogs);
      }

      // Notify all active admin and storefront subscribers of the synced data
      if (typeof window !== 'undefined') {
        if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('funkyfox:store_updated'));
      }
      }
    } catch (err) {
      console.error('[StoreService] Failed to sync from Supabase:', err);
    }
  }

  // Synchronize admin products directly into baseProducts so storefront is in 100% sync
  private syncStorefrontProducts() {
    try {
      const activeAdminProducts = this.products.filter((p) => p.status === 'active');

      activeAdminProducts.forEach((ap) => {
        const existingIdx = baseProducts.findIndex((bp) => bp.id === ap.id);
        const transformed = {
          id: ap.id,
          name: ap.name,
          price: ap.price,
          originalPrice: ap.originalPrice,
          image: ap.image,
          images: ap.images,
          alt: ap.alt,
          category: ap.category as any,
          colors:
            ap.variants && ap.variants.length > 0
              ? Array.from(
                  new Map(
                    ap.variants.map((v) => [v.colorName, { name: v.colorName, value: v.colorHex }])
                  ).values()
                )
              : [{ name: 'Standard', value: '#171717' }],
          sizes:
            ap.variants && ap.variants.length > 0
              ? (Array.from(new Set(ap.variants.map((v) => v.size))) as any)
              : ['S', 'M', 'L', 'XL'],
          inStock: ap.totalStock > 0,
          isNew: ap.isNew,
          isBestseller: ap.isBestseller,
          featuredOrder: ap.featuredOrder || 99,
          description: ap.description,
          details: ap.details,
        };

        if (existingIdx >= 0) {
          baseProducts[existingIdx] = { ...baseProducts[existingIdx], ...transformed };
        } else {
          baseProducts.unshift(transformed as any);
        }
      });

      // Remove draft or archived products from public baseProducts array
      const archivedIds = new Set(this.products.filter((p) => p.status !== 'active').map((p) => p.id));
      for (let i = baseProducts.length - 1; i >= 0; i--) {
        if (archivedIds.has(baseProducts[i].id)) {
          baseProducts.splice(i, 1);
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('funkyfox:store_updated'));
      }
    } catch (e) {
      console.warn('[StoreService] Storefront sync warning:', e);
    }
  }

  private persist(key: string, data: any) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('[StoreService] Persist failed:', e);
    }
  }

  // --- PRODUCTS CRUD ---
  getProducts(): AdminProduct[] {
    return [...this.products];
  }

  getProductById(id: string): AdminProduct | undefined {
    return this.products.find((p) => p.id === id);
  }

  saveProduct(product: AdminProduct, adminName: string = 'Admin'): AdminProduct {
    const existingIndex = this.products.findIndex((p) => p.id === product.id);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const prev = this.products[existingIndex];
      const updated: AdminProduct = {
        ...prev,
        ...product,
        updatedAt: now,
      };
      this.products[existingIndex] = updated;

      if (prev.totalStock !== updated.totalStock) {
        this.logInventory({
          productId: updated.id,
          productName: updated.name,
          sku: updated.sku,
          previousQuantity: prev.totalStock,
          newQuantity: updated.totalStock,
          change: updated.totalStock - prev.totalStock,
          reason: 'manual_adjustment',
          note: 'Stock modified via product editor',
          adminName,
        });
      }

      this.logAudit(adminName, 'UPDATE_PRODUCT', 'Product', updated.id, `Updated product "${updated.name}"`);
    } else {
      const newProduct: AdminProduct = {
        ...product,
        createdAt: now,
        updatedAt: now,
      };
      this.products.unshift(newProduct);

      this.logInventory({
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        previousQuantity: 0,
        newQuantity: newProduct.totalStock,
        change: newProduct.totalStock,
        reason: 'initial_stock',
        note: 'New product creation',
        adminName,
      });

      this.logAudit(adminName, 'CREATE_PRODUCT', 'Product', newProduct.id, `Created product "${newProduct.name}"`);
    }

    this.persist('products', this.products);
    this.syncStorefrontProducts();

    // Asynchronously upsert to Supabase if connected
    if (isSupabaseConfigured) {
      SupabaseDbService.upsertProduct(product).catch((err) =>
        console.error('[StoreService] Cloud product sync failed:', err)
      );
    }

    return product;
  }

  deleteProduct(id: string, adminName: string = 'Admin'): boolean {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const removed = this.products.splice(idx, 1)[0];
    this.persist('products', this.products);
    this.logAudit(adminName, 'DELETE_PRODUCT', 'Product', id, `Deleted product "${removed.name}"`);
    this.syncStorefrontProducts();

    if (isSupabaseConfigured) {
      SupabaseDbService.deleteProduct(id).catch((err) =>
        console.error('[StoreService] Cloud product deletion failed:', err)
      );
    }

    return true;
  }

  duplicateProduct(id: string, adminName: string = 'Admin'): AdminProduct | null {
    const original = this.products.find((p) => p.id === id);
    if (!original) return null;

    const newId = `${original.id}-copy-${Date.now().toString().slice(-4)}`;
    const duplicate: AdminProduct = {
      ...original,
      id: newId,
      slug: newId,
      name: `${original.name} (Copy)`,
      sku: `${original.sku}-COPY`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants: original.variants.map((v) => ({
        ...v,
        id: `${newId}-${v.size}-${v.colorName}`.toLowerCase(),
        productId: newId,
        sku: `${v.sku}-COPY`,
      })),
    };

    this.products.unshift(duplicate);
    this.persist('products', this.products);
    this.logAudit(adminName, 'DUPLICATE_PRODUCT', 'Product', duplicate.id, `Duplicated "${original.name}"`);
    this.syncStorefrontProducts();

    if (isSupabaseConfigured) {
      SupabaseDbService.upsertProduct(duplicate).catch((err) =>
        console.error('[StoreService] Cloud product duplicate failed:', err)
      );
    }

    return duplicate;
  }

  bulkUpdateStatus(ids: string[], status: 'draft' | 'active' | 'archived', adminName: string = 'Admin') {
    this.products = this.products.map((p) =>
      ids.includes(p.id) ? { ...p, status, updatedAt: new Date().toISOString() } : p
    );
    this.persist('products', this.products);
    this.logAudit(
      adminName,
      'BULK_UPDATE_STATUS',
      'Product',
      ids.join(','),
      `Changed status to ${status} for ${ids.length} products`
    );
    this.syncStorefrontProducts();

    if (isSupabaseConfigured) {
      ids.forEach((id) => {
        const prod = this.getProductById(id);
        if (prod) SupabaseDbService.upsertProduct(prod).catch(() => {});
      });
    }
  }

  bulkDeleteProducts(ids: string[], adminName: string = 'Admin') {
    this.products = this.products.filter((p) => !ids.includes(p.id));
    this.persist('products', this.products);
    this.logAudit(adminName, 'BULK_DELETE', 'Product', ids.join(','), `Bulk deleted ${ids.length} products`);
    this.syncStorefrontProducts();

    if (isSupabaseConfigured) {
      ids.forEach((id) => SupabaseDbService.deleteProduct(id).catch(() => {}));
    }
  }

  // --- CATEGORIES CRUD ---
  getCategories(): AdminCategory[] {
    return [...this.categories];
  }

  saveCategory(category: AdminCategory, adminName: string = 'Admin'): AdminCategory {
    const idx = this.categories.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      this.categories[idx] = category;
      this.logAudit(adminName, 'UPDATE_CATEGORY', 'Category', category.id, `Updated category ${category.name}`);
    } else {
      this.categories.push(category);
      this.logAudit(adminName, 'CREATE_CATEGORY', 'Category', category.id, `Created category ${category.name}`);
    }
    this.persist('categories', this.categories);

    if (isSupabaseConfigured) {
      SupabaseDbService.upsertCategory(category).catch(() => {});
    }

    return category;
  }

  deleteCategory(id: string, adminName: string = 'Admin'): boolean {
    const idx = this.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const removed = this.categories.splice(idx, 1)[0];
    this.persist('categories', this.categories);
    this.logAudit(adminName, 'DELETE_CATEGORY', 'Category', id, `Deleted category ${removed.name}`);

    if (isSupabaseConfigured) {
      SupabaseDbService.deleteCategory(id).catch((err) => console.error('[StoreService] Supabase deleteCategory error:', err));
    }

    return true;
  }

  // --- INVENTORY MANAGEMENT ---
  getInventoryLogs(): InventoryLog[] {
    return [...this.inventoryLogs];
  }

  logInventory(entry: Omit<InventoryLog, 'id' | 'createdAt'>) {
    const log: InventoryLog = {
      id: `inv-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...entry,
      createdAt: new Date().toISOString(),
    };
    this.inventoryLogs.unshift(log);
    this.persist('inventory_logs', this.inventoryLogs);

    if (isSupabaseConfigured) {
      SupabaseDbService.logInventory(entry).catch(() => {});
    }
  }

  adjustVariantStock(
    productId: string,
    variantId: string,
    newQuantity: number,
    reason: InventoryLog['reason'],
    note: string,
    adminName: string = 'Admin'
  ) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return;
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return;

    const prevQty = variant.stock;
    variant.stock = Math.max(0, newQuantity);
    variant.inStock = variant.stock > 0;

    product.totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

    this.logInventory({
      productId: product.id,
      productName: product.name,
      sku: variant.sku,
      variantId: variant.id,
      variantLabel: `${variant.colorName} / ${variant.size}`,
      previousQuantity: prevQty,
      newQuantity: variant.stock,
      change: variant.stock - prevQty,
      reason,
      note,
      adminName,
    });

    this.persist('products', this.products);
    this.syncStorefrontProducts();

    if (isSupabaseConfigured) {
      SupabaseDbService.upsertProduct(product).catch(() => {});
    }
  }

  // --- ORDERS CRUD ---
  async createCustomerOrder(input: {
    idempotencyKey?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country?: string;
    };
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      size: string;
      color: string;
      image: string;
    }>;
    subtotal: number;
    discount?: number;
    couponCode?: string;
    shippingCharge?: number;
    tax?: number;
    total: number;
    paymentMethod?: string;
  }): Promise<AdminOrder> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase database is not configured. Customer checkout is currently disabled.');
    }

    const randomOrderNumber = `FF-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const customerId = `cust-${Date.now()}`;

    const orderItems = input.items.map((it, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      productId: it.id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      size: it.size,
      color: it.color,
      image: it.image,
      sku: `FF-${it.id.toUpperCase().slice(0, 6)}-${it.size}`,
    }));

    const newOrder: AdminOrder = {
      id: orderId,
      orderNumber: randomOrderNumber,
      customer: {
        id: customerId,
        name: input.customerName,
        email: input.customerEmail,
        phone: input.customerPhone,
      },
      shippingAddress: {
        fullName: input.customerName,
        phone: input.customerPhone,
        street: input.deliveryAddress.street,
        city: input.deliveryAddress.city,
        state: input.deliveryAddress.state,
        pincode: input.deliveryAddress.pincode,
        country: input.deliveryAddress.country || 'India',
      },
      items: orderItems,
      subtotal: input.subtotal,
      discount: input.discount || 0,
      couponCode: input.couponCode,
      shippingCharge: input.shippingCharge || 0,
      tax: input.tax || 0,
      total: input.total,
      paymentMethod: (input.paymentMethod as any) || 'cod',
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
      shippingStatus: 'pending',
      timeline: [
        {
          status: 'pending',
          label: 'Order Placed',
          description: 'Customer confirmed checkout order on storefront',
          timestamp: new Date().toISOString(),
          performedBy: 'Storefront Customer',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Authoritative Cloud Persistence via PostgreSQL RPC (Atomic locking & validation)
    const cloudResult = await SupabaseDbService.createCustomerOrder({
      idempotencyKey: input.idempotencyKey,
      customer: {
        id: customerId,
        name: input.customerName,
        email: input.customerEmail,
        phone: input.customerPhone,
      },
      shippingAddress: newOrder.shippingAddress,
      items: input.items.map((it) => ({
        productId: it.id,
        id: it.id,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        size: it.size,
        color: it.color,
        image: it.image,
        sku: `FF-${it.id.toUpperCase().slice(0, 6)}-${it.size}`,
      })),
      couponCode: input.couponCode,
      paymentMethod: input.paymentMethod || 'cod',
    });

    if (cloudResult?.orderId) {
      newOrder.id = cloudResult.orderId;
    }
    if (cloudResult?.orderNumber) {
      newOrder.orderNumber = cloudResult.orderNumber;
    }
    if (cloudResult?.total !== undefined) {
      newOrder.total = cloudResult.total;
    }
    if (cloudResult?.subtotal !== undefined) {
      newOrder.subtotal = cloudResult.subtotal;
    }
    if (cloudResult?.discount !== undefined) {
      newOrder.discount = cloudResult.discount;
    }
    if (cloudResult?.shippingCharge !== undefined) {
      newOrder.shippingCharge = cloudResult.shippingCharge;
    }
    if (cloudResult?.tax !== undefined) {
      newOrder.tax = cloudResult.tax;
    }

    // 2. Add to orders list
    this.orders.unshift(newOrder);
    this.persist('orders', this.orders);

    // 3. Decrement stock & record inventory logs
    input.items.forEach((item) => {
      const prod = this.products.find((p) => p.id === item.id);
      if (prod) {
        const prevTotal = prod.totalStock;
        prod.totalStock = Math.max(0, prod.totalStock - item.quantity);

        if (prod.variants && prod.variants.length > 0) {
          const variant = prod.variants.find(
            (v) =>
              (v.size.toLowerCase() === item.size.toLowerCase() &&
                v.colorName.toLowerCase() === item.color.toLowerCase()) ||
              v.size.toLowerCase() === item.size.toLowerCase()
          );
          if (variant) {
            const prevVarStock = variant.stock;
            variant.stock = Math.max(0, variant.stock - item.quantity);
            variant.inStock = variant.stock > 0;
            this.logInventory({
              productId: prod.id,
              productName: prod.name,
              sku: variant.sku,
              variantId: variant.id,
              variantLabel: `${variant.colorName} / ${variant.size}`,
              previousQuantity: prevVarStock,
              newQuantity: variant.stock,
              change: -item.quantity,
              reason: 'order_fulfillment',
              note: `Order ${newOrder.orderNumber} placed`,
              adminName: 'Storefront Checkout',
            });
          }
        }
        this.persist('products', this.products);
      }
    });

    // 4. Upsert customer
    const existingCust = this.customers.find(
      (c) => c.email.toLowerCase() === input.customerEmail.toLowerCase()
    );
    if (existingCust) {
      existingCust.totalOrders += 1;
      existingCust.totalSpent += newOrder.total;
      existingCust.lastOrderDate = new Date().toISOString();
      existingCust.phone = input.customerPhone || existingCust.phone;
    } else {
      this.customers.push({
        id: customerId,
        name: input.customerName,
        email: input.customerEmail,
        phone: input.customerPhone,
        totalOrders: 1,
        totalSpent: newOrder.total,
        lastOrderDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
    this.persist('customers', this.customers);

    // 5. Synchronize storefront and active browser tabs
    this.syncStorefrontProducts();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('funkyfox:store_updated'));
    }

    return newOrder;
  }

  getOrders(): AdminOrder[] {
    return [...this.orders];
  }

  getOrderById(id: string): AdminOrder | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  updateOrderStatus(
    orderId: string,
    newStatus: AdminOrder['shippingStatus'],
    performedBy: string = 'Admin',
    note?: string
  ): AdminOrder | undefined {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    const previousStatus = order.shippingStatus;
    order.shippingStatus = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === 'delivered') {
      order.fulfillmentStatus = 'fulfilled';
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'captured';
      }
    } else if (newStatus === 'cancelled') {
      order.fulfillmentStatus = 'unfulfilled';
    }

    const eventLabelMap: Record<string, string> = {
      pending: 'Order Placed',
      confirmed: 'Order Confirmed',
      processing: 'Processing in Warehouse',
      packed: 'Items Packed & Label Printed',
      shipped: 'Handed to Logistics Partner',
      out_for_delivery: 'Out for Courier Delivery',
      delivered: 'Package Delivered',
      cancelled: 'Order Cancelled',
      returned: 'Returned & Restocked',
    };

    order.timeline.push({
      status: newStatus,
      label: eventLabelMap[newStatus] || newStatus,
      description: note || `Order status updated from ${previousStatus} to ${newStatus}.`,
      timestamp: new Date().toISOString(),
      performedBy,
    });

    this.persist('orders', this.orders);
    this.logAudit(performedBy, 'UPDATE_ORDER_STATUS', 'Order', order.id, `Status updated to ${newStatus}`);

    if (isSupabaseConfigured) {
      SupabaseDbService.updateOrderStatus(order.id, newStatus, order.timeline).catch(() => {});
    }

    return order;
  }

  addOrderNote(orderId: string, noteText: string, adminName: string = 'Admin') {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;
    if (!order.internalNotes) order.internalNotes = [];
    order.internalNotes.push(`[${new Date().toLocaleDateString('en-IN')}] ${adminName}: ${noteText}`);
    this.persist('orders', this.orders);
  }

  updateShipmentDetails(orderId: string, shipment: AdminOrder['shipmentDetails'], adminName: string = 'Admin') {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;
    order.shipmentDetails = { ...order.shipmentDetails, ...shipment };
    if (shipment?.awbCode) {
      order.shippingStatus = 'shipped';
      order.timeline.push({
        status: 'shipped',
        label: 'Shipment Generated (Shiprocket)',
        description: `Assigned courier: ${shipment.courierName || 'Shiprocket'} | AWB: ${shipment.awbCode}`,
        timestamp: new Date().toISOString(),
        performedBy: adminName,
      });
    }
    this.persist('orders', this.orders);
    this.logAudit(adminName, 'SHIPMENT_UPDATED', 'Order', order.id, `AWB: ${shipment?.awbCode}`);
  }

  async refreshOrder(orderId: string): Promise<AdminOrder | undefined> {
    if (isSupabaseConfigured) {
      const fresh = await SupabaseDbService.fetchOrderById(orderId);
      if (fresh) {
        const idx = this.orders.findIndex((o) => o.id === orderId);
        if (idx !== -1) {
          this.orders[idx] = fresh;
        } else {
          this.orders.unshift(fresh);
        }
        this.persist('orders', this.orders);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('funkyfox:store_updated'));
        }
        return fresh;
      }
    }
    return this.getOrderById(orderId);
  }

  async dispatchShiprocket(orderId: string, adminName: string = 'Admin') {
    const result = await SupabaseDbService.dispatchShiprocketShipment(orderId);

    // Refresh live order record directly from Supabase
    await this.refreshOrder(orderId);

    this.logAudit(
      adminName,
      'SHIPMENT_DISPATCHED',
      'Order',
      orderId,
      `Shiprocket AWB: ${result.awb_code || 'N/A'}, Courier: ${result.courier_name || 'N/A'}`
    );

    return result;
  }

  async refreshTracking(orderId: string, adminName: string = 'Admin') {
    const result = await SupabaseDbService.trackShiprocketShipment(orderId);

    // Refresh live order record directly from Supabase
    await this.refreshOrder(orderId);

    this.logAudit(
      adminName,
      'TRACKING_REFRESHED',
      'Order',
      orderId,
      `Status: ${result.current_status || 'N/A'}, AWB: ${result.awb_code || 'N/A'}`
    );

    return result;
  }

  // --- CUSTOMERS ---
  getCustomers(): AdminCustomer[] {
    return [...this.customers];
  }

  getCustomerById(id: string): AdminCustomer | undefined {
    return this.customers.find((c) => c.id === id);
  }

  saveCustomerNote(id: string, note: string, adminName: string = 'Admin') {
    const customer = this.customers.find((c) => c.id === id);
    if (!customer) return;
    customer.notes = note;
    this.persist('customers', this.customers);
    this.logAudit(adminName, 'UPDATE_CUSTOMER_NOTE', 'Customer', id, 'Updated customer internal notes');

    if (isSupabaseConfigured) {
      SupabaseDbService.upsertCustomer(customer).catch((err) => console.error('[StoreService] Supabase upsertCustomer error:', err));
    }
  }

  // --- COUPONS ---
  getCoupons(): AdminCoupon[] {
    return [...this.coupons];
  }

  saveCoupon(coupon: AdminCoupon, adminName: string = 'Admin'): AdminCoupon {
    const idx = this.coupons.findIndex((c) => c.id === coupon.id);
    if (idx >= 0) {
      this.coupons[idx] = coupon;
      this.logAudit(adminName, 'UPDATE_COUPON', 'Coupon', coupon.code, `Updated coupon ${coupon.code}`);
    } else {
      this.coupons.unshift(coupon);
      this.logAudit(adminName, 'CREATE_COUPON', 'Coupon', coupon.code, `Created coupon ${coupon.code}`);
    }
    this.persist('coupons', this.coupons);

    if (isSupabaseConfigured) {
      SupabaseDbService.upsertCoupon(coupon).catch((err) => console.error('[StoreService] Supabase upsertCoupon error:', err));
    }

    return coupon;
  }

  deleteCoupon(id: string, adminName: string = 'Admin'): boolean {
    const idx = this.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const removed = this.coupons.splice(idx, 1)[0];
    this.persist('coupons', this.coupons);
    this.logAudit(adminName, 'DELETE_COUPON', 'Coupon', id, `Deleted coupon ${removed.code}`);

    if (isSupabaseConfigured) {
      SupabaseDbService.deleteCoupon(id).catch((err) => console.error('[StoreService] Supabase deleteCoupon error:', err));
    }

    return true;
  }

  // --- BANNERS / CONTENT ---
  getBanners(): HomepageBanner[] {
    return [...this.banners];
  }

  saveBanner(banner: HomepageBanner, adminName: string = 'Admin'): HomepageBanner {
    const idx = this.banners.findIndex((b) => b.id === banner.id);
    if (idx >= 0) {
      this.banners[idx] = banner;
      this.logAudit(adminName, 'UPDATE_BANNER', 'Banner', banner.id, `Updated banner "${banner.title}"`);
    } else {
      this.banners.push(banner);
      this.logAudit(adminName, 'CREATE_BANNER', 'Banner', banner.id, `Created banner "${banner.title}"`);
    }
    this.persist('banners', this.banners);

    if (isSupabaseConfigured) {
      SupabaseDbService.upsertBanner(banner).catch((err) => console.error('[StoreService] Supabase upsertBanner error:', err));
    }

    return banner;
  }

  deleteBanner(id: string, adminName: string = 'Admin'): boolean {
    const idx = this.banners.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    const removed = this.banners.splice(idx, 1)[0];
    this.persist('banners', this.banners);
    this.logAudit(adminName, 'DELETE_BANNER', 'Banner', id, `Deleted banner "${removed.title}"`);

    if (isSupabaseConfigured) {
      SupabaseDbService.deleteBanner(id).catch((err) => console.error('[StoreService] Supabase deleteBanner error:', err));
    }

    return true;
  }

  // --- MEDIA LIBRARY ---
  getMediaItems(): MediaItem[] {
    return [...this.mediaItems];
  }

  addMediaItem(item: Omit<MediaItem, 'id' | 'createdAt'>): MediaItem {
    const newItem: MediaItem = {
      id: `med-${Date.now()}`,
      ...item,
      createdAt: new Date().toISOString(),
    };
    this.mediaItems.unshift(newItem);
    this.persist('media', this.mediaItems);

    if (isSupabaseConfigured) {
      SupabaseDbService.saveMediaItem(newItem).catch((err) => console.error('[StoreService] Supabase saveMediaItem error:', err));
    }

    return newItem;
  }

  deleteMediaItem(id: string, adminName: string = 'Admin'): boolean {
    const item = this.mediaItems.find((m) => m.id === id);
    if (!item) return false;
    const isReferencedInProducts = this.products.some(
      (p) => p.image === item.url || p.images.includes(item.url)
    );
    if (isReferencedInProducts) {
      throw new Error(`Cannot delete: image is actively referenced in product catalogue.`);
    }
    this.mediaItems = this.mediaItems.filter((m) => m.id !== id);
    this.persist('media', this.mediaItems);
    this.logAudit(adminName, 'DELETE_MEDIA', 'Media', id, `Deleted media ${item.name}`);

    if (isSupabaseConfigured) {
      SupabaseDbService.deleteMediaItem(id).catch((err) => console.error('[StoreService] Supabase deleteMediaItem error:', err));
    }

    return true;
  }

  // --- SETTINGS ---
  getSettings(): StoreSettings {
    return { ...this.settings };
  }

  saveSettings(newSettings: Partial<StoreSettings>, adminName: string = 'Admin'): StoreSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.persist('settings', this.settings);
    this.logAudit(adminName, 'UPDATE_SETTINGS', 'Settings', 'global', 'Updated store configuration');

    if (isSupabaseConfigured) {
      SupabaseDbService.updateStoreSettings(this.settings).catch((err) => console.error('[StoreService] Supabase updateStoreSettings error:', err));
    }

    return this.settings;
  }

  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  private logAudit(
    adminName: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: string
  ) {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminName,
      action,
      resourceType,
      resourceId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) this.auditLogs.length = 500;
    this.persist('audit_logs', this.auditLogs);

    if (isSupabaseConfigured) {
      SupabaseDbService.logAudit(adminName, action, resourceType, resourceId, details).catch(() => {});
    }
  }
}

export const storeService = new StoreService();
