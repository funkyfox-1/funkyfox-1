// Central Mock Data Module for Funky Fox Customer Account Experience
// Local Demo Simulation — No real passwords or sensitive data collected or transmitted.
import { storeService } from '../admin/services/storeService';
import type { AdminOrder } from '../admin/lib/types';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  color: string;
  size: string;
  quantity: number;
  image: string;
}

export interface OrderMilestone {
  status: string;
  label: string;
  date: string;
  time: string;
  description: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  estimatedDelivery: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: {
    type: string;
    last4: string;
    expiry?: string;
    holderName?: string;
    status: string;
  };
  deliveryAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    mapsUrl?: string;
  };
  carrier?: {
    name: string;
    trackingNumber: string;
    trackingUrl: string;
  };
  note?: string;
  timeline: OrderMilestone[];
  cancellation?: {
    cancelledAt: string;
    reason: string;
    refundStatus: string;
  };
}

export interface UserAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  mapsUrl?: string;
  coordinates?: { lat: number; lng: number };
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  title: string;
  comment: string;
  fitFeedback: 'true_to_size' | 'runs_small' | 'runs_large';
  date: string;
  verifiedPurchase: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
  preferredSize: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Prashanth Poloju',
  email: 'prashanth@funkyfox.in',
  phone: '+91 98765 43210',
  avatar: '/images/standard/model-tall-clean.jpg',
  memberSince: 'October 2024',
  preferredSize: 'L'
};

const DEFAULT_ADDRESSES: UserAddress[] = [
  {
    id: 'addr-1',
    label: 'Home (Default)',
    fullName: 'Prashanth Poloju',
    phone: '+91 98765 43210',
    street: 'Door No. 40-1-58, MG Road, Near Benz Circle',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    pincode: '520010',
    country: 'India',
    isDefault: true,
    mapsUrl: 'https://maps.google.com/maps?q=16.5168591%2C80.628406&z=17&hl=en',
    coordinates: { lat: 16.5168591, lng: 80.628406 }
  },
  {
    id: 'addr-2',
    label: 'Studio / Work',
    fullName: 'Prashanth Poloju',
    phone: '+91 98765 43210',
    street: 'Plot 14, IT SEZ Tech Enclave, Gannavaram Road',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    pincode: '521101',
    country: 'India',
    isDefault: false,
    mapsUrl: 'https://maps.google.com/maps?q=16.5168591%2C80.628406&z=17&hl=en',
    coordinates: { lat: 16.5168591, lng: 80.628406 }
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ff-853c67ho928',
    orderNumber: '#853C67HO928',
    date: '01 Nov 2026, 12:10 PM',
    estimatedDelivery: '05 Nov 2026',
    status: 'processing',
    items: [
      {
        id: 'french-terry-hoodie',
        name: 'French Terry Hoodie · Washed Charcoal',
        price: 1499,
        originalPrice: 1999,
        color: 'Washed Charcoal',
        size: 'L',
        quantity: 1,
        image: '/images/products/demo-french-terry-hoodie.jpg'
      },
      {
        id: 'essential-cotton-t-shirt',
        name: 'Essential Cotton T-Shirt',
        price: 599,
        originalPrice: 799,
        color: 'Ivory',
        size: 'L',
        quantity: 1,
        image: '/images/product-tshirt.webp'
      }
    ],
    subtotal: 2098,
    discount: 200,
    discountCode: 'EVERYDAY10',
    shipping: 0,
    tax: 94,
    total: 1992,
    paymentMethod: {
      type: 'UPI / Google Pay',
      last4: 'poloju@okaxis',
      status: 'Paid',
      holderName: 'Prashanth Poloju'
    },
    deliveryAddress: {
      fullName: 'Prashanth Poloju',
      phone: '+91 98765 43210',
      street: 'Door No. 40-1-58, MG Road, Near Benz Circle',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      pincode: '520010',
      country: 'India',
      mapsUrl: 'https://maps.google.com/maps?q=16.5168591%2C80.628406&z=17&hl=en'
    },
    note: 'Please leave with building concierge if door is unanswered.',
    timeline: [
      {
        status: 'placed',
        label: 'Order Placed',
        date: '01 Nov 2026',
        time: '12:10 PM',
        description: 'Order confirmed and verified via instant UPI payment.',
        completed: true
      },
      {
        status: 'paid',
        label: 'Order Paid',
        date: '01 Nov 2026',
        time: '12:11 PM',
        description: 'Payment settled successfully via Cashfree Gateway.',
        completed: true
      },
      {
        status: 'processing',
        label: 'Preparing Fit',
        date: '01 Nov 2026',
        time: '01:30 PM',
        description: 'Warehouse is quality-checking fabric drape and hand-packing with biodegradable wrap.',
        completed: true,
        current: true
      },
      {
        status: 'shipped',
        label: 'Shipped Out',
        date: '02 Nov 2026 (Est.)',
        time: '10:00 AM',
        description: 'Package handed over to BlueDart courier hub.',
        completed: false
      },
      {
        status: 'delivered',
        label: 'Doorstep Delivery',
        date: '05 Nov 2026 (Est.)',
        time: 'By 06:00 PM',
        description: 'Delivered to your saved Benz Circle Vijayawada address.',
        completed: false
      }
    ]
  },
  {
    id: 'ff-18204',
    orderNumber: '#18204',
    date: '28 Oct 2026, 10:42 AM',
    estimatedDelivery: '02 Nov 2026',
    status: 'shipped',
    items: [
      {
        id: 'lightweight-utility-jacket',
        name: 'Lightweight Utility Jacket',
        price: 1799,
        originalPrice: 2299,
        color: 'Khaki',
        size: 'L',
        quantity: 1,
        image: '/images/product-jacket.webp'
      }
    ],
    subtotal: 1799,
    discount: 0,
    shipping: 0,
    tax: 81,
    total: 1880,
    carrier: {
      name: 'BlueDart Express',
      trackingNumber: 'BD-84729104IN',
      trackingUrl: 'https://bluedart.com'
    },
    paymentMethod: {
      type: 'Visa Card',
      last4: '8888',
      expiry: '05/30',
      holderName: 'Prashanth Poloju',
      status: 'Paid'
    },
    deliveryAddress: {
      fullName: 'Prashanth Poloju',
      phone: '+91 98765 43210',
      street: 'Door No. 40-1-58, MG Road, Near Benz Circle',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      pincode: '520010',
      country: 'India',
      mapsUrl: 'https://maps.google.com/maps?q=16.5168591%2C80.628406&z=17&hl=en'
    },
    note: 'Call before delivery.',
    timeline: [
      {
        status: 'placed',
        label: 'Order Placed',
        date: '28 Oct 2026',
        time: '10:42 AM',
        description: 'Confirmation email and SMS sent to prashanth@funkyfox.in.',
        completed: true
      },
      {
        status: 'packed',
        label: 'Packed & Inspected',
        date: '28 Oct 2026',
        time: '04:05 PM',
        description: 'Picked and packed at the Bhiwandi fulfillment centre.',
        completed: true
      },
      {
        status: 'with_courier',
        label: 'With the Courier',
        date: '29 Oct 2026',
        time: '09:18 AM',
        description: 'Handed over to carrier, scan confirmed at Vijayawada sort hub.',
        completed: true,
        current: true
      },
      {
        status: 'delivered',
        label: 'Expected Delivery',
        date: '02 Nov 2026',
        time: '12:00 PM – 05:00 PM',
        description: 'Out for doorstep delivery.',
        completed: false
      }
    ]
  },
  {
    id: 'ff-74129',
    orderNumber: '#74129',
    date: '15 Oct 2026, 04:20 PM',
    estimatedDelivery: '18 Oct 2026',
    status: 'delivered',
    items: [
      {
        id: 'canvas-workwear-jacket',
        name: 'Canvas Workwear Chore Jacket',
        price: 1999,
        originalPrice: 2698,
        color: 'Tobacco Duck',
        size: 'L',
        quantity: 1,
        image: '/images/products/demo-canvas-workwear-jacket.jpg'
      },
      {
        id: 'waffle-knit-crew-tee',
        name: 'Waffle-Knit Crew Tee',
        price: 749,
        originalPrice: 899,
        color: 'Ecru',
        size: 'L',
        quantity: 1,
        image: '/images/products/demo-waffle-knit-crew-tee.png'
      }
    ],
    subtotal: 2748,
    discount: 250,
    discountCode: 'AUTUMN250',
    shipping: 0,
    tax: 122,
    total: 2620,
    paymentMethod: {
      type: 'UPI / PhonePe',
      last4: 'poloju@ybl',
      status: 'Paid',
      holderName: 'Prashanth Poloju'
    },
    deliveryAddress: {
      fullName: 'Prashanth Poloju',
      phone: '+91 98765 43210',
      street: 'Door No. 40-1-58, MG Road, Near Benz Circle',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      pincode: '520010',
      country: 'India',
      mapsUrl: 'https://maps.google.com/maps?q=16.5168591%2C80.628406&z=17&hl=en'
    },
    timeline: [
      {
        status: 'placed',
        label: 'Order Placed',
        date: '15 Oct 2026',
        time: '04:20 PM',
        description: 'Order confirmed and paid.',
        completed: true
      },
      {
        status: 'shipped',
        label: 'Shipped',
        date: '16 Oct 2026',
        time: '11:15 AM',
        description: 'Dispatched via BlueDart AWB #BD-91823719IN.',
        completed: true
      },
      {
        status: 'delivered',
        label: 'Delivered',
        date: '18 Oct 2026',
        time: '02:45 PM',
        description: 'Package delivered and received by Prashanth Poloju. 15-day exchange window open.',
        completed: true,
        current: true
      }
    ]
  },
  {
    id: 'ff-63201',
    orderNumber: '#63201',
    date: '02 Oct 2026, 09:15 AM',
    estimatedDelivery: '06 Oct 2026',
    status: 'cancelled',
    items: [
      {
        id: 'tailored-wool-overcoat',
        name: 'Tailored Wool Overcoat',
        price: 2999,
        originalPrice: 3999,
        color: 'Camel',
        size: 'XL',
        quantity: 1,
        image: '/images/products/demo-tailored-wool-overcoat.jpg'
      }
    ],
    subtotal: 2999,
    discount: 0,
    shipping: 0,
    tax: 135,
    total: 3134,
    paymentMethod: {
      type: 'UPI / Google Pay',
      last4: 'poloju@okaxis',
      status: 'Refunded',
      holderName: 'Prashanth Poloju'
    },
    cancellation: {
      cancelledAt: '02 Oct 2026, 10:45 AM',
      reason: 'Ordered wrong size; re-ordered in Size L.',
      refundStatus: 'Full refund of ₹3,134 credited to original UPI VPA within 12 minutes.'
    },
    deliveryAddress: {
      fullName: 'Prashanth Poloju',
      phone: '+91 98765 43210',
      street: 'Door No. 40-1-58, MG Road, Near Benz Circle',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      pincode: '520010',
      country: 'India',
      mapsUrl: 'https://maps.google.com/maps?q=16.5168591%2C80.628406&z=17&hl=en'
    },
    timeline: [
      {
        status: 'placed',
        label: 'Order Placed',
        date: '02 Oct 2026',
        time: '09:15 AM',
        description: 'Order placed online.',
        completed: true
      },
      {
        status: 'cancelled',
        label: 'Order Cancelled & Refunded',
        date: '02 Oct 2026',
        time: '10:45 AM',
        description: 'Cancelled by customer before dispatch. Refund settled instantly.',
        completed: true,
        current: true
      }
    ]
  }
];

const INITIAL_WISHLIST: string[] = [
  'french-terry-hoodie',
  'tailored-wool-overcoat',
  'canvas-workwear-jacket',
  'essential-cotton-t-shirt',
  'lightweight-utility-jacket',
  'relaxed-fit-shirt'
];

const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1',
    productId: 'french-terry-hoodie',
    productName: 'French Terry Hoodie · Washed Charcoal',
    productImage: '/images/products/demo-french-terry-hoodie.jpg',
    rating: 5,
    title: 'Substantial 380 GSM fabric with incredible double-layer hood',
    comment:
      'The 380 GSM looped French terry drape is heavyweight without feeling stiff. The hood stays structured instead of flopping down, and the washed charcoal tone goes with everything.',
    fitFeedback: 'true_to_size',
    date: '10 Nov 2026',
    verifiedPurchase: true
  },
  {
    id: 'rev-2',
    productId: 'essential-cotton-t-shirt',
    productName: 'Essential Cotton T-Shirt',
    productImage: '/images/product-tshirt.webp',
    rating: 5,
    title: 'The collar actually holds up after 10+ washes',
    comment:
      'I was sceptical about the heavyweight collar claim, but after washing twice a week for a month, there is zero bacon neck. Heavy drape, cuts right at the shoulder. Ordering in two more colours.',
    fitFeedback: 'true_to_size',
    date: '19 Oct 2026',
    verifiedPurchase: true
  },
  {
    id: 'rev-3',
    productId: 'tailored-wool-overcoat',
    productName: 'Tailored Wool Overcoat · Camel',
    productImage: '/images/products/demo-tailored-wool-overcoat.jpg',
    rating: 5,
    title: 'Architectural silhouette that fits easily over knitwear',
    comment:
      'Finding an overcoat with proper shoulder structure and clean lapel roll in India is nearly impossible. This Melton wool piece nails the tailoring. Smooth lining and warm deep pockets.',
    fitFeedback: 'true_to_size',
    date: '05 Nov 2026',
    verifiedPurchase: true
  }
];

// Local Storage Keys
const STORAGE_KEYS = {
  USER: 'funky_fox_demo_user',
  ORDERS: 'funky_fox_demo_orders',
  WISHLIST: 'funky_fox_demo_wishlist',
  ADDRESSES: 'funky_fox_demo_addresses',
  REVIEWS: 'funky_fox_demo_reviews'
};

// Safe JSON parser
function safeGet<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

// User Profile & Session
export function getDemoUser(): UserProfile | null {
  return safeGet<UserProfile | null>(STORAGE_KEYS.USER, null);
}

export function isDemoLoggedIn(): boolean {
  return getDemoUser() !== null;
}

export function loginDemo(email?: string, name?: string, phone?: string): UserProfile {
  const current = getDemoUser() || DEFAULT_PROFILE;
  const updated: UserProfile = {
    ...current,
    email: email || current.email,
    name: name || (email ? email.split('@')[0] : current.name),
    phone: phone || current.phone,
  };
  safeSet(STORAGE_KEYS.USER, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('funky-fox-auth-change', { detail: { user: updated } }));
  }
  return updated;
}

export function logoutDemo() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('funky-fox-auth-change', { detail: { user: null } }));
  }
}

export function updateDemoProfile(updates: Partial<UserProfile>): UserProfile {
  const current = getDemoUser() || DEFAULT_PROFILE;
  const merged = { ...current, ...updates };
  safeSet(STORAGE_KEYS.USER, merged);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('funky-fox-auth-change', { detail: { user: merged } }));
  }
  return merged;
}

// Orders Management & Authoritative Store Adapter
export function adminOrderToCustomerOrder(adminOrder: AdminOrder): Order {
  const createdAt = adminOrder.createdAt ? new Date(adminOrder.createdAt) : new Date();
  const dateStr = createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Map admin shippingStatus to customer Order status
  let customerStatus: Order['status'] = 'processing';
  if (adminOrder.shippingStatus === 'cancelled') {
    customerStatus = 'cancelled';
  } else if (adminOrder.shippingStatus === 'returned') {
    customerStatus = 'returned';
  } else if (adminOrder.shippingStatus === 'delivered') {
    customerStatus = 'delivered';
  } else if (adminOrder.shippingStatus === 'shipped' || adminOrder.shippingStatus === 'out_for_delivery') {
    customerStatus = 'shipped';
  } else {
    customerStatus = 'processing';
  }

  // Map timeline
  let timeline: OrderMilestone[] = [];
  if (adminOrder.timeline && adminOrder.timeline.length > 0) {
    timeline = adminOrder.timeline.map((tl, idx, arr) => {
      const tlDate = tl.timestamp ? new Date(tl.timestamp) : new Date();
      return {
        status: tl.status,
        label: tl.label || tl.status,
        date: tlDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: tlDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        description: tl.description || '',
        completed: true,
        current: idx === arr.length - 1,
      };
    });
  } else {
    timeline = [
      {
        status: 'placed',
        label: 'Order Placed',
        date: dateStr,
        time: timeStr,
        description: 'Order confirmed and verified on storefront.',
        completed: true,
        current: true,
      },
    ];
  }

  return {
    id: adminOrder.id,
    orderNumber: adminOrder.orderNumber,
    date: `${dateStr}, ${timeStr}`,
    estimatedDelivery: adminOrder.shipmentDetails?.courierName ? '2–3 business days' : '3–4 business days',
    status: customerStatus,
    items: (adminOrder.items || []).map((it) => ({
      id: it.id || it.productId,
      name: it.name,
      price: it.price,
      originalPrice: Math.round(it.price * 1.25),
      color: it.color || 'Standard',
      size: it.size || 'M',
      quantity: it.quantity,
      image: it.image || '/images/product-tshirt.webp',
    })),
    subtotal: adminOrder.subtotal,
    discount: adminOrder.discount || 0,
    discountCode: adminOrder.couponCode,
    shipping: adminOrder.shippingCharge || 0,
    tax: adminOrder.tax || 0,
    total: adminOrder.total,
    paymentMethod: {
      type: (adminOrder.paymentMethod || 'UPI').toUpperCase(),
      last4: adminOrder.paymentDetails?.transactionId?.slice(-4) || 'Online',
      status: adminOrder.paymentStatus === 'captured' ? 'Paid' : (adminOrder.paymentStatus === 'refunded' ? 'Refunded' : 'Pending'),
      holderName: adminOrder.customer?.name || adminOrder.shippingAddress?.fullName || 'Customer',
    },
    deliveryAddress: {
      fullName: adminOrder.shippingAddress?.fullName || adminOrder.customer?.name || 'Customer',
      phone: adminOrder.shippingAddress?.phone || adminOrder.customer?.phone || '',
      street: adminOrder.shippingAddress?.street + (adminOrder.shippingAddress?.addressLine2 ? ', ' + adminOrder.shippingAddress.addressLine2 : ''),
      city: adminOrder.shippingAddress?.city || '',
      state: adminOrder.shippingAddress?.state || '',
      pincode: adminOrder.shippingAddress?.pincode || '',
      country: adminOrder.shippingAddress?.country || 'India',
      mapsUrl: `https://maps.google.com/maps?q=${encodeURIComponent((adminOrder.shippingAddress?.city || '') + ' ' + (adminOrder.shippingAddress?.pincode || ''))}`,
    },
    carrier: adminOrder.shipmentDetails?.courierName
      ? {
          name: adminOrder.shipmentDetails.courierName,
          trackingNumber: adminOrder.shipmentDetails.awbCode || 'Pending Dispatch',
          trackingUrl: adminOrder.shipmentDetails.trackingUrl || '#',
        }
      : undefined,
    timeline,
    cancellation: adminOrder.cancellation,
  };
}

export function getDemoOrders(): Order[] {
  const user = getDemoUser();
  const allAdminOrders = storeService.getOrders();

  if (user?.email) {
    const cleanEmail = user.email.trim().toLowerCase();
    const customerAdminOrders = allAdminOrders.filter(
      (o) => o.customer?.email?.trim().toLowerCase() === cleanEmail
    );

    if (customerAdminOrders.length > 0) {
      const converted = customerAdminOrders.map(adminOrderToCustomerOrder);
      if (cleanEmail === DEFAULT_PROFILE.email.toLowerCase()) {
        const initialFiltered = INITIAL_ORDERS.filter(
          (init) => !customerAdminOrders.some((co) => co.id === init.id || co.orderNumber === init.orderNumber)
        );
        return [...converted, ...initialFiltered];
      }
      return converted;
    }

    if (cleanEmail === DEFAULT_PROFILE.email.toLowerCase()) {
      // Reflect all live store orders in demo account alongside initial demonstration orders
      const allConverted = allAdminOrders.map(adminOrderToCustomerOrder);
      if (allConverted.length > 0) {
        const initialFiltered = INITIAL_ORDERS.filter(
          (init) => !allConverted.some((co) => co.id === init.id || co.orderNumber === init.orderNumber)
        );
        return [...allConverted, ...initialFiltered];
      }
      return INITIAL_ORDERS;
    }

    // Fallback: If customer has placed orders in storeService
    const allConverted = allAdminOrders.map(adminOrderToCustomerOrder);
    if (allConverted.length > 0) {
      return allConverted;
    }

    return [];
  }

  return [];
}

export function createDemoOrder(orderData: Partial<Order>): Order {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const orderNum = orderData.orderNumber || `#${Math.floor(64000 + Math.random() * 9000)}`;

  const newOrder: Order = {
    id: orderNum.replace('#', 'ff-'),
    orderNumber: orderNum,
    date: `${dateStr}, ${timeStr}`,
    estimatedDelivery: '4 business days',
    status: 'processing',
    items: orderData.items || [],
    subtotal: orderData.subtotal || 0,
    discount: orderData.discount || 0,
    discountCode: orderData.discountCode,
    shipping: orderData.shipping || 0,
    tax: orderData.tax || 0,
    total: orderData.total || 0,
    paymentMethod: orderData.paymentMethod || {
      type: 'UPI / Online Payment',
      last4: 'Verified',
      status: 'Paid',
    },
    deliveryAddress: orderData.deliveryAddress || {
      fullName: 'Arjun Mehta',
      phone: '+91 98765 43210',
      street: 'Door No. 40-1-58, MG Road',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      pincode: '520010',
      country: 'India',
    },
    timeline: [
      {
        status: 'placed',
        label: 'Order Placed',
        date: dateStr,
        time: timeStr,
        description: 'Order confirmed and verified on storefront.',
        completed: true,
        current: true,
      },
    ],
  };

  return newOrder;
}

export function getDemoOrderById(id: string): Order | undefined {
  if (!id) return undefined;
  const clean = id.trim().toLowerCase().replace('#', '');

  const allAdminOrders = storeService.getOrders();
  const foundAdmin = allAdminOrders.find(
    (o) => o.id.toLowerCase() === clean || o.orderNumber.toLowerCase().replace('#', '') === clean
  );
  if (foundAdmin) {
    return adminOrderToCustomerOrder(foundAdmin);
  }

  return INITIAL_ORDERS.find(
    (o) => o.id.toLowerCase() === clean || o.orderNumber.toLowerCase().replace('#', '') === clean
  );
}

export function cancelDemoOrder(orderId: string, reason: string): { success: boolean; error?: string } {
  const adminOrder = storeService.getOrderById(orderId);
  if (adminOrder) {
    return storeService.cancelCustomerOrder(orderId, reason, 'Customer');
  }

  const orders = safeGet<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const index = orders.findIndex(
    (o) => o.id === orderId || o.orderNumber === orderId
  );
  if (index === -1) return { success: false, error: 'Order not found' };

  const target = orders[index];
  if (target.status !== 'processing') {
    return {
      success: false,
      error: `Order #${target.orderNumber} cannot be cancelled because it is already ${target.status}. You may request an exchange or return upon delivery.`
    };
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const updatedOrder: Order = {
    ...target,
    status: 'cancelled',
    cancellation: {
      cancelledAt: `${dateStr}, ${timeStr}`,
      reason: reason || 'Cancelled by customer',
      refundStatus: `Cancellation recorded. Refund request for ₹${target.total.toLocaleString('en-IN')} logged for verification.`
    },
    timeline: [
      ...target.timeline.map((t) => ({ ...t, current: false })),
      {
        status: 'cancelled',
        label: 'Order Cancelled',
        date: dateStr,
        time: timeStr,
        description: `Cancelled: ${reason || 'Customer request'}.`,
        completed: true,
        current: true
      }
    ]
  };

  orders[index] = updatedOrder;
  safeSet(STORAGE_KEYS.ORDERS, orders);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('funkyfox:store_updated'));
    window.dispatchEvent(new CustomEvent('funky-fox-order-change', { detail: { orderId, status: 'cancelled' } }));
  }

  return { success: true };
}

// Wishlist
export function getDemoWishlist(): string[] {
  return safeGet<string[]>(STORAGE_KEYS.WISHLIST, INITIAL_WISHLIST);
}

export function toggleDemoWishlist(productId: string): boolean {
  const list = getDemoWishlist();
  const exists = list.includes(productId);
  const updated = exists ? list.filter(id => id !== productId) : [...list, productId];
  safeSet(STORAGE_KEYS.WISHLIST, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('funky-fox-wishlist-change', { detail: { wishlist: updated } }));
  }
  return !exists;
}

export function isInDemoWishlist(productId: string): boolean {
  return getDemoWishlist().includes(productId);
}

// Addresses
export function getDemoAddresses(): UserAddress[] {
  return safeGet<UserAddress[]>(STORAGE_KEYS.ADDRESSES, DEFAULT_ADDRESSES);
}

export function saveDemoAddress(address: Omit<UserAddress, 'id'> & { id?: string }): UserAddress {
  const addresses = getDemoAddresses();
  if (address.id) {
    const idx = addresses.findIndex(a => a.id === address.id);
    if (idx !== -1) {
      if (address.isDefault) {
        addresses.forEach(a => (a.isDefault = false));
      }
      addresses[idx] = address as UserAddress;
      safeSet(STORAGE_KEYS.ADDRESSES, addresses);
      return addresses[idx];
    }
  }
  if (address.isDefault) {
    addresses.forEach(a => (a.isDefault = false));
  }
  const created: UserAddress = {
    ...address,
    id: `addr-${Date.now()}`,
    isDefault: address.isDefault || addresses.length === 0
  };
  addresses.unshift(created);
  safeSet(STORAGE_KEYS.ADDRESSES, addresses);
  return created;
}

export function deleteDemoAddress(id: string): boolean {
  const addresses = getDemoAddresses().filter(a => a.id !== id);
  if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {
    addresses[0].isDefault = true;
  }
  safeSet(STORAGE_KEYS.ADDRESSES, addresses);
  return true;
}

// Reviews
export function getDemoReviews(): ProductReview[] {
  return safeGet<ProductReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
}

export function addDemoReview(review: Omit<ProductReview, 'id' | 'date' | 'verifiedPurchase'>): ProductReview {
  const reviews = getDemoReviews();
  const created: ProductReview = {
    ...review,
    id: `rev-${Date.now()}`,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    verifiedPurchase: true
  };
  reviews.unshift(created);
  safeSet(STORAGE_KEYS.REVIEWS, reviews);
  return created;
}

// Reset helper
export function resetDemoData() {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_PROFILE));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(INITIAL_WISHLIST));
  localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(DEFAULT_ADDRESSES));
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
}

