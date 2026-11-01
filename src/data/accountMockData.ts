// Central Mock Data Module for Funky Fox Customer Account Experience
// Local Demo Simulation — No real passwords or sensitive data collected or transmitted.

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
  tier: string;
  rewardsPoints: number;
  preferredSize: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Arjun Mehta',
  email: 'arjun.mehta@example.com',
  phone: '+91 98765 43210',
  avatar: '/images/standard/model-tall-clean.jpg',
  memberSince: 'October 2024',
  tier: 'Fox Club Gold',
  rewardsPoints: 450,
  preferredSize: 'L'
};

const DEFAULT_ADDRESSES: UserAddress[] = [
  {
    id: 'addr-1',
    label: 'Home',
    fullName: 'Arjun Mehta',
    phone: '+91 98765 43210',
    street: 'Flat 402, Hill View Apartments, 14th Road, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    country: 'India',
    isDefault: true
  },
  {
    id: 'addr-2',
    label: 'Studio / Work',
    fullName: 'Arjun Mehta',
    phone: '+91 98765 43210',
    street: 'Unit 12, Laxmi Industrial Estate, New Link Road, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    country: 'India',
    isDefault: false
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
        id: 'essential-cotton-t-shirt',
        name: 'Essential Cotton T-Shirt',
        price: 599,
        originalPrice: 799,
        color: 'Navy Blue',
        size: 'L',
        quantity: 1,
        image: '/images/product-tshirt.webp'
      },
      {
        id: 'relaxed-fit-shirt',
        name: 'Relaxed Fit Linen Shirt',
        price: 899,
        originalPrice: 1099,
        color: 'Terracotta',
        size: 'L',
        quantity: 1,
        image: '/images/product-shirt.webp'
      }
    ],
    subtotal: 1498,
    discount: 150,
    discountCode: 'EVERYDAY10',
    shipping: 0,
    tax: 67,
    total: 1415,
    paymentMethod: {
      type: 'UPI / Google Pay',
      last4: 'mehta@okaxis',
      status: 'Paid',
      holderName: 'Arjun Mehta'
    },
    deliveryAddress: {
      fullName: 'Arjun Mehta',
      phone: '+91 98765 43210',
      street: 'Flat 402, Hill View Apartments, 14th Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      country: 'India'
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
        description: 'Payment of ₹1,415 settled successfully.',
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
        description: 'Delivered to your saved Bandra West address.',
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
        color: 'Caramel Brown',
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
      holderName: 'Arjun Mehta',
      status: 'Paid'
    },
    deliveryAddress: {
      fullName: 'Arjun Mehta',
      phone: '+91 98765 43210',
      street: 'Flat 402, Hill View Apartments, 14th Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      country: 'India'
    },
    note: 'Call before delivery.',
    timeline: [
      {
        status: 'placed',
        label: 'Order Placed',
        date: '28 Oct 2026',
        time: '10:42 AM',
        description: 'Confirmation email and SMS sent to arjun.mehta@example.com.',
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
        description: 'Handed over to carrier, scan confirmed at Mumbai sort hub.',
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
        id: 'relaxed-fit-chinos',
        name: 'Relaxed Fit Everyday Chinos',
        price: 1299,
        originalPrice: 1599,
        color: 'Sand Beige',
        size: '32',
        quantity: 1,
        image: '/images/product-jeans.webp'
      },
      {
        id: 'waffle-knit-crew-tee',
        name: 'Waffle Knit Crew Tee',
        price: 749,
        originalPrice: 899,
        color: 'Off-White',
        size: 'L',
        quantity: 1,
        image: '/images/category-tshirts.jpg'
      }
    ],
    subtotal: 2048,
    discount: 200,
    discountCode: 'AUTUMN200',
    shipping: 0,
    tax: 92,
    total: 1940,
    paymentMethod: {
      type: 'UPI / PhonePe',
      last4: 'arjun@ybl',
      status: 'Paid',
      holderName: 'Arjun Mehta'
    },
    deliveryAddress: {
      fullName: 'Arjun Mehta',
      phone: '+91 98765 43210',
      street: 'Flat 402, Hill View Apartments, 14th Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      country: 'India'
    },
    timeline: [
      {
        status: 'placed',
        label: 'Order Placed',
        date: '15 Oct 2026',
        time: '04:20 PM',
        description: 'Order confirmed.',
        completed: true
      },
      {
        status: 'shipped',
        label: 'Shipped',
        date: '16 Oct 2026',
        time: '11:15 AM',
        description: 'Dispatched via BlueDart.',
        completed: true
      },
      {
        status: 'delivered',
        label: 'Delivered',
        date: '18 Oct 2026',
        time: '02:45 PM',
        description: 'Package delivered and received by Arjun Mehta. 15-day return window open until 02 Nov 2026.',
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
        id: 'heavyweight-boxy-tee',
        name: 'Heavyweight Boxy Tee',
        price: 699,
        originalPrice: 899,
        color: 'Washed Olive',
        size: 'M',
        quantity: 2,
        image: '/images/category-tshirts.jpg'
      }
    ],
    subtotal: 1398,
    discount: 0,
    shipping: 0,
    tax: 62,
    total: 1460,
    paymentMethod: {
      type: 'UPI / Google Pay',
      last4: 'mehta@okaxis',
      status: 'Refunded',
      holderName: 'Arjun Mehta'
    },
    cancellation: {
      cancelledAt: '02 Oct 2026, 10:45 AM',
      reason: 'Ordered wrong size; re-ordered in Size L.',
      refundStatus: 'Full refund of ₹1,460 credited to original UPI VPA within 12 minutes.'
    },
    deliveryAddress: {
      fullName: 'Arjun Mehta',
      phone: '+91 98765 43210',
      street: 'Flat 402, Hill View Apartments, 14th Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      country: 'India'
    },
    timeline: [
      {
        status: 'placed',
        label: 'Order Placed',
        date: '02 Oct 2026',
        time: '09:15 AM',
        description: 'Order placed via online payment.',
        completed: true
      },
      {
        status: 'cancelled',
        label: 'Order Cancelled',
        date: '02 Oct 2026',
        time: '10:45 AM',
        description: 'Cancelled by customer before warehouse packaging. 100% refund initiated.',
        completed: true,
        current: true
      }
    ]
  },
  {
    id: 'ff-52190',
    orderNumber: '#52190',
    date: '18 Sep 2026, 02:10 PM',
    estimatedDelivery: '22 Sep 2026',
    status: 'returned',
    items: [
      {
        id: 'vintage-wash-pocket-tee',
        name: 'Vintage Wash Pocket Tee',
        price: 649,
        originalPrice: 799,
        color: 'Dusty Slate',
        size: 'M',
        quantity: 1,
        image: '/images/category-tshirts.jpg'
      }
    ],
    subtotal: 649,
    discount: 0,
    shipping: 60,
    tax: 32,
    total: 741,
    paymentMethod: {
      type: 'Cash on Delivery',
      last4: 'COD',
      status: 'Refunded to Bank Account',
      holderName: 'Arjun Mehta'
    },
    deliveryAddress: {
      fullName: 'Arjun Mehta',
      phone: '+91 98765 43210',
      street: 'Flat 402, Hill View Apartments, 14th Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      country: 'India'
    },
    timeline: [
      {
        status: 'delivered',
        label: 'Delivered',
        date: '21 Sep 2026',
        time: '01:30 PM',
        description: 'Delivered via courier.',
        completed: true
      },
      {
        status: 'return_picked',
        label: 'Return Picked Up',
        date: '24 Sep 2026',
        time: '11:00 AM',
        description: 'Reverse pickup completed at doorstep.',
        completed: true
      },
      {
        status: 'returned',
        label: 'Refund Completed',
        date: '25 Sep 2026',
        time: '04:15 PM',
        description: 'Quality check approved. ₹741 credited to bank account.',
        completed: true,
        current: true
      }
    ]
  }
];

const INITIAL_WISHLIST: string[] = [
  'lightweight-utility-jacket',
  'essential-cotton-t-shirt',
  'relaxed-fit-shirt',
  'heavyweight-boxy-tee'
];

const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1',
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
    id: 'rev-2',
    productId: 'relaxed-fit-chinos',
    productName: 'Relaxed Fit Everyday Chinos',
    productImage: '/images/product-jeans.webp',
    rating: 5,
    title: 'Roomy through the thighs without being bag-like',
    comment:
      'Finding trousers that fit athletic legs without drowning the ankles is tough. These nailed the taper. Deep front pockets and subtle waist elasticity for long days at work.',
    fitFeedback: 'true_to_size',
    date: '20 Oct 2026',
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
  return safeGet<UserProfile | null>(STORAGE_KEYS.USER, DEFAULT_PROFILE);
}

export function isDemoLoggedIn(): boolean {
  return !!safeGet<UserProfile | null>(STORAGE_KEYS.USER, DEFAULT_PROFILE);
}

export function loginDemo(email?: string, name?: string): UserProfile {
  const current = getDemoUser() || DEFAULT_PROFILE;
  const updated: UserProfile = {
    ...current,
    email: email || current.email,
    name: name || current.name
  };
  safeSet(STORAGE_KEYS.USER, updated);
  return updated;
}

export function logoutDemo() {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function updateDemoProfile(updates: Partial<UserProfile>): UserProfile {
  const current = getDemoUser() || DEFAULT_PROFILE;
  const merged = { ...current, ...updates };
  safeSet(STORAGE_KEYS.USER, merged);
  return merged;
}

// Orders Management
export function getDemoOrders(): Order[] {
  return safeGet<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
}

export function getDemoOrderById(id: string): Order | undefined {
  const orders = getDemoOrders();
  const clean = id.toLowerCase().replace('#', '');
  return orders.find(
    o => o.id.toLowerCase() === clean || o.orderNumber.toLowerCase().replace('#', '') === clean
  );
}

export function cancelDemoOrder(orderId: string, reason: string): { success: boolean; error?: string } {
  const orders = getDemoOrders();
  const index = orders.findIndex(
    o => o.id === orderId || o.orderNumber === orderId
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
      refundStatus: `Full refund of ₹${target.total.toLocaleString('en-IN')} initiated to your payment method.`
    },
    timeline: [
      ...target.timeline.map(t => ({ ...t, current: false })),
      {
        status: 'cancelled',
        label: 'Order Cancelled',
        date: dateStr,
        time: timeStr,
        description: `Cancelled: ${reason || 'Customer request'}. Refund processed in demo mode.`,
        completed: true,
        current: true
      }
    ]
  };

  orders[index] = updatedOrder;
  safeSet(STORAGE_KEYS.ORDERS, orders);
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

