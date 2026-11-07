export type AdminRole = 'super_admin' | 'admin' | 'manager';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | string;
  colorName: string;
  colorHex: string;
  sku: string;
  stock: number;
  price?: number;
  inStock: boolean;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  sku: string;
  shortDescription?: string;
  description?: string;
  details?: string[];
  price: number;
  originalPrice?: number;
  costPrice?: number;
  taxRate?: number;
  category: string;
  subcategory?: string;
  brand: string;
  tags: string[];
  image: string;
  images: string[];
  alt: string;
  status: 'draft' | 'active' | 'archived';
  isNew?: boolean;
  isBestseller?: boolean;
  featuredOrder?: number;
  totalStock: number;
  lowStockThreshold: number;
  allowBackorders: boolean;
  variants: ProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  isVisible: boolean;
  order: number;
  productCount?: number;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  variantId?: string;
  variantLabel?: string;
  previousQuantity: number;
  newQuantity: number;
  change: number;
  reason: 'initial_stock' | 'restock' | 'order_fulfillment' | 'customer_return' | 'damaged' | 'manual_adjustment' | 'inventory_count';
  note?: string;
  adminName: string;
  createdAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';

export interface AdminOrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
  sku: string;
}

export interface AdminOrderTimelineEvent {
  status: OrderStatus;
  label: string;
  description: string;
  timestamp: string;
  performedBy?: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: AdminOrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingCharge: number;
  tax: number;
  total: number;
  paymentMethod: 'cashfree' | 'razorpay' | 'cod' | 'upi' | 'card' | 'netbanking';
  paymentStatus: PaymentStatus;
  paymentDetails?: {
    provider?: string;
    cfPaymentId?: string;
    cfOrderId?: string | number;
    paymentSessionId?: string;
    transactionId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    amount?: number;
    method?: string;
    capturedAt?: string;
    refundId?: string;
    refundAmount?: number;
    refundStatus?: string;
  };
  fulfillmentStatus: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled';
  shippingStatus: OrderStatus;
  shipmentDetails?: {
    shiprocketOrderId?: string;
    shipmentId?: string;
    courierName?: string;
    awbCode?: string;
    labelUrl?: string;
    invoiceUrl?: string;
    trackingUrl?: string;
    pickupStatus?: string;
    dispatchedAt?: string;
    dispatchedBy?: string;
    etd?: string | null;
    currentStatus?: string;
    lastTrackedAt?: string;
    trackingActivities?: Array<{
      date: string;
      status: string;
      activity: string;
      location?: string;
      raw_label?: string;
    }>;
  };
  timeline: AdminOrderTimelineEvent[];
  cancellation?: {
    cancelledAt: string;
    reason: string;
    refundStatus: string;
  };
  internalNotes?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses?: Array<{
    id: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
  }>;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  notes?: string;
  createdAt: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  perCustomerLimit: number;
  isActive: boolean;
}

export interface HomepageBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  position: 'hero' | 'middle' | 'strip';
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: number; // bytes
  mimeType: string;
  dimensions?: { width: number; height: number };
  usedIn: string[];
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storeLogoUrl: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  currency: string;
  taxGstRate: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
  returnWindowDays: number;
  policies: {
    returnPolicy: string;
    privacyPolicy: string;
    termsAndConditions: string;
  };
  apiKeys: {
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
    shiprocketEmail?: string;
    shiprocketPassword?: string;
    supabaseUrl?: string;
    supabaseAnonKey?: string;
  };
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  timestamp: string;
}
