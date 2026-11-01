import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  Edit2,
} from 'lucide-react'
import { products, formatPrice, getCategoryFallbackImage } from '../data/products'
import { calculateShipping, PROVISIONAL_SHIPPING_POLICY } from '../config/shipping'
import { EmptyState, InlineFieldError, OrderConfirmation } from './feedback'
import SlideCommit from './SlideCommit'
import type { CartItem } from './CartPage'
import Footer from './Footer'
import './CheckoutPage.css'

interface CheckoutPageProps {
  cartItems: CartItem[]
}

export type CheckoutStage = 'delivery' | 'payment' | 'review'

interface FormValues {
  fullName: string
  email: string
  phone: string
  country: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
}

interface FormErrors {
  fullName?: string
  email?: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  pincode?: string
}

const STORAGE_KEY = 'funky-fox-checkout-form'

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Chandigarh',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
]

interface PaymentMethodOption {
  id: string
  title: string
  subtitle: string
  badge?: string
  icon: React.ReactNode
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'upi',
    title: 'UPI (Instant Preview)',
    subtitle: 'Google Pay, PhonePe, Paytm, BHIM or any UPI app',
    badge: 'Popular',
    icon: <Smartphone size={20} className="text-fox shrink-0" />,
  },
  {
    id: 'card',
    title: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, RuPay & American Express',
    icon: <CreditCard size={20} className="text-fox shrink-0" />,
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    subtitle: 'HDFC, ICICI, SBI, Axis, Kotak & 40+ Indian banks',
    icon: <Building2 size={20} className="text-fox shrink-0" />,
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    subtitle: 'Pay at your doorstep with Cash or UPI QR',
    icon: <Banknote size={20} className="text-fox shrink-0" />,
  },
]

export default function CheckoutPage({ cartItems }: CheckoutPageProps) {
  const navigate = useNavigate()

  // Checkout Stages: 1. delivery -> 2. payment -> 3. review
  const [stage, setStage] = React.useState<CheckoutStage>('delivery')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>('upi')

  // Initial form values from sessionStorage if present
  const [values, setValues] = React.useState<FormValues>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // ignore JSON errors
    }
    return {
      fullName: '',
      email: '',
      phone: '',
      country: 'India',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
    }
  })

  const [errors, setErrors] = React.useState<FormErrors>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})

  // Scroll to top on mount and on stage changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [stage])

  // Save to sessionStorage when values change
  React.useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(values))
    } catch {
      // ignore storage errors
    }
  }, [values])

  // Subtotal & items calculation
  const totalItems = React.useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.qty, 0)
  }, [cartItems])

  const subtotal = React.useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.id)
      return acc + (product?.price || 0) * item.qty
    }, 0)
  }, [cartItems])

  const { shippingFee, isFree, displayFee, isProvisional } = calculateShipping(subtotal)
  const orderTotal = subtotal + shippingFee

  // Field change handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))

    // Clear error for field once user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Field blur handler
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, values[name as keyof FormValues])
  }

  // Validate single field
  const validateField = (name: string, value: string): string | undefined => {
    let err: string | undefined

    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          err = 'Please enter your full name.'
        } else if (value.trim().length < 2) {
          err = 'Name must be at least 2 characters long.'
        }
        break

      case 'email':
        if (!value.trim()) {
          err = 'Enter a valid email address, such as name@example.com.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          err = 'Enter a valid email address, such as name@example.com.'
        }
        break

      case 'phone': {
        const cleanPhone = value.replace(/[\s\-()]/g, '')
        if (!cleanPhone) {
          err = 'Enter a valid 10-digit Indian mobile number.'
        } else if (!/^(?:\+?91|0)?[6-9]\d{9}$/.test(cleanPhone)) {
          err = 'Enter a valid 10-digit Indian mobile number.'
        }
        break
      }

      case 'addressLine1':
        if (!value.trim()) {
          err = 'Please enter your house, flat, or building details.'
        }
        break

      case 'addressLine2':
        if (!value.trim()) {
          err = 'Please enter your street, locality, or area.'
        }
        break

      case 'city':
        if (!value.trim()) {
          err = 'Please enter your city.'
        }
        break

      case 'state':
        if (!value.trim()) {
          err = 'Please select your state.'
        }
        break

      case 'pincode': {
        const cleanPin = value.replace(/\s/g, '')
        if (!cleanPin) {
          err = 'Enter a valid 6-digit PIN code.'
        } else if (!/^[1-9]\d{5}$/.test(cleanPin)) {
          err = 'Enter a valid 6-digit PIN code.'
        }
        break
      }

      default:
        break
    }

    setErrors((prev) => ({ ...prev, [name]: err }))
    return err
  }

  // Full form validation on submission
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!values.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.'
    } else if (values.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters long.'
    }

    if (!values.email.trim()) {
      newErrors.email = 'Enter a valid email address, such as name@example.com.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      newErrors.email = 'Enter a valid email address, such as name@example.com.'
    }

    const cleanPhone = values.phone.replace(/[\s\-()]/g, '')
    if (!cleanPhone) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number.'
    } else if (!/^(?:\+?91|0)?[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number.'
    }

    if (!values.addressLine1.trim()) {
      newErrors.addressLine1 = 'Please enter your house, flat, or building details.'
    }

    if (!values.addressLine2.trim()) {
      newErrors.addressLine2 = 'Please enter your street, locality, or area.'
    }

    if (!values.city.trim()) {
      newErrors.city = 'Please enter your city.'
    }

    if (!values.state.trim()) {
      newErrors.state = 'Please select your state.'
    }

    const cleanPin = values.pincode.replace(/\s/g, '')
    if (!cleanPin) {
      newErrors.pincode = 'Enter a valid 6-digit PIN code.'
    } else if (!/^[1-9]\d{5}$/.test(cleanPin)) {
      newErrors.pincode = 'Enter a valid 6-digit PIN code.'
    }

    setErrors(newErrors)
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      pincode: true,
    })

    return Object.keys(newErrors).length === 0
  }

  // Handle stage 1 -> 2 progression
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setStage('payment')
    } else {
      const fieldOrder = [
        'fullName',
        'email',
        'phone',
        'addressLine1',
        'addressLine2',
        'city',
        'state',
        'pincode',
      ]
      setTimeout(() => {
        for (const f of fieldOrder) {
          const el = document.getElementById(f)
          if (el && el.getAttribute('aria-invalid') === 'true') {
            el.focus()
            break
          }
        }
      }, 50)
    }
  }

  // Handle stage 2 -> 3 progression
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault()
    setStage('review')
  }

  // Handle final confirmation via SlideCommit on stage 3
  const handleFinalOrderConfirm = async () => {
    // 500ms delay for smooth animation
    await new Promise((resolve) => setTimeout(resolve, 500))
    navigate('/order-confirmation', {
      state: {
        orderReference: `FF-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName: values.fullName,
        customerEmail: values.email,
        deliveryCity: values.city,
        deliveryState: values.state,
        deliveryPincode: values.pincode,
        orderTotal,
        paymentMethod: PAYMENT_METHODS.find((p) => p.id === selectedPaymentMethod)?.title || 'UPI',
        itemsCount: totalItems,
      },
    })
  }

  // Handle empty cart
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page flex flex-col justify-between min-h-screen">
        {/* Checkout Header */}
        <div className="checkout-top-bar">
          <div className="checkout-top-bar-inner">
            <Link
              to="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-soft hover:text-ink transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to bag</span>
            </Link>
            <Link
              to="/"
              className="group flex items-baseline gap-1.5"
              aria-label="Funky Fox Home"
            >
              <span className="font-display text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
                FUNKY <span className="text-fox transition-colors group-hover:text-fox-deep">FOX</span>
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-fox transition-transform duration-200 group-hover:scale-125" />
            </Link>
            <div className="w-16" />
          </div>
        </div>

        <div className="checkout-container py-16 flex-1 flex flex-col items-center justify-center">
          <EmptyState
            icon={<ShoppingBag size={32} strokeWidth={1.5} />}
            heading="YOUR BAG IS EMPTY."
            message="You haven't added anything to your bag yet. Please add items before checking out."
            primaryAction={{
              label: 'EXPLORE COLLECTION',
              to: '/products',
            }}
            secondaryAction={{
              label: 'RETURN TO BAG',
              to: '/cart',
            }}
          />
        </div>

        <Footer />
      </div>
    )
  }

  const selectedPaymentObj = PAYMENT_METHODS.find((p) => p.id === selectedPaymentMethod)

  return (
    <div className="checkout-page flex flex-col justify-between min-h-screen">
      {/* 1. Top Checkout Header with FUNKY FOX wordmark and Back link */}
      <div className="checkout-top-bar">
        <div className="checkout-top-bar-inner">
          <Link
            to="/cart"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-soft hover:text-ink transition-colors"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            <span>Back to bag</span>
          </Link>

          <Link
            to="/"
            className="group flex items-baseline gap-1.5"
            aria-label="Funky Fox Home"
          >
            <span className="font-display text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
              FUNKY <span className="text-fox transition-colors group-hover:text-fox-deep">FOX</span>
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-fox transition-transform duration-200 group-hover:scale-125" />
          </Link>

          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-soft">
            <ShieldCheck size={14} className="text-fox shrink-0" />
            <span className="hidden sm:inline">Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="checkout-container flex-1">
        {/* Page Heading & Supporting Text */}
        <div className="border-b border-line pb-6 pt-6 sm:pb-8 sm:pt-8">
          <p className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[.3em] text-soft sm:text-[10.5px]">
            <span aria-hidden="true" className="h-[3px] w-6 rounded-full bg-fox" />
            Order Finalisation
          </p>
          <h1 className="mt-2 font-display text-3xl font-black uppercase leading-none tracking-[-0.035em] text-ink sm:text-4xl lg:text-5xl">
            {stage === 'delivery' && 'ALMOST YOURS.'}
            {stage === 'payment' && 'PAYMENT METHOD.'}
            {stage === 'review' && 'FINAL ORDER REVIEW.'}
          </h1>
          <p className="mt-2.5 max-w-xl text-xs sm:text-sm text-soft leading-relaxed">
            {stage === 'delivery' && 'Step 1 of 3: Enter your contact and shipping details for doorstep delivery.'}
            {stage === 'payment' && 'Step 2 of 3: Select how you prefer to complete your order preview.'}
            {stage === 'review' && 'Step 3 of 3: Review your order details and slide to verify the preview.'}
          </p>

          {/* 3-Step Interactive Progress Bar */}
          <nav className="checkout-progress" aria-label="Checkout Progress">
            <button
              type="button"
              onClick={() => setStage('delivery')}
              className={`checkout-progress-step ${
                stage === 'delivery'
                  ? 'checkout-progress-step--active'
                  : 'checkout-progress-step--completed'
              }`}
            >
              <span className="checkout-progress-num">
                {stage !== 'delivery' ? <CheckCircle2 size={12} /> : '1'}
              </span>
              <span>1. Delivery</span>
            </button>

            <span className="checkout-progress-divider" aria-hidden="true" />

            <button
              type="button"
              onClick={() => {
                if (validateForm()) {
                  setStage('payment')
                }
              }}
              className={`checkout-progress-step ${
                stage === 'payment'
                  ? 'checkout-progress-step--active'
                  : stage === 'review'
                  ? 'checkout-progress-step--completed'
                  : ''
              }`}
              disabled={stage === 'delivery' && !values.fullName}
            >
              <span className="checkout-progress-num">
                {stage === 'review' ? <CheckCircle2 size={12} /> : '2'}
              </span>
              <span>2. Payment</span>
            </button>

            <span className="checkout-progress-divider" aria-hidden="true" />

            <div
              className={`checkout-progress-step ${
                stage === 'review' ? 'checkout-progress-step--active' : ''
              }`}
            >
              <span className="checkout-progress-num">3</span>
              <span>3. Review</span>
            </div>
          </nav>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="checkout-layout">
          {/* LEFT COLUMN: Active Stage Content */}
          <div className="checkout-form-column">
            {/* STAGE 1: DELIVERY DETAILS */}
            {stage === 'delivery' && (
              <form onSubmit={handleProceedToPayment} noValidate>
                {/* SECTION 1: Contact details */}
                <section className="checkout-section" aria-labelledby="contact-heading">
                  <div className="checkout-section-header">
                    <h2 id="contact-heading" className="checkout-section-title">
                      <span className="checkout-section-step">1</span>
                      Contact details
                    </h2>
                  </div>

                  <div className="checkout-group">
                    <label htmlFor="fullName" className="checkout-label">
                      Full name <span className="text-fox">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      autoComplete="name"
                      value={values.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={Boolean(errors.fullName && touched.fullName)}
                      aria-describedby={errors.fullName && touched.fullName ? 'fullName-error' : undefined}
                      className={`checkout-input ${
                        errors.fullName && touched.fullName
                          ? 'checkout-input--error'
                          : ''
                      }`}
                      placeholder="e.g. Arjun Mehta"
                    />
                    {touched.fullName && (
                      <InlineFieldError id="fullName-error" message={errors.fullName} />
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="checkout-group">
                      <label htmlFor="email" className="checkout-label">
                        Email address <span className="text-fox">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-invalid={Boolean(errors.email && touched.email)}
                        aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                        className={`checkout-input ${
                          errors.email && touched.email
                            ? 'checkout-input--error'
                            : ''
                        }`}
                        placeholder="arjun@example.com"
                      />
                      {touched.email && (
                        <InlineFieldError id="email-error" message={errors.email} />
                      )}
                    </div>

                    <div className="checkout-group">
                      <label htmlFor="phone" className="checkout-label">
                        Phone number <span className="text-fox">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        autoComplete="tel"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-invalid={Boolean(errors.phone && touched.phone)}
                        aria-describedby={errors.phone && touched.phone ? 'phone-error' : undefined}
                        className={`checkout-input ${
                          errors.phone && touched.phone
                            ? 'checkout-input--error'
                            : ''
                        }`}
                        placeholder="98765 43210"
                      />
                      {touched.phone && (
                        <InlineFieldError id="phone-error" message={errors.phone} />
                      )}
                    </div>
                  </div>
                </section>

                {/* SECTION 2: Delivery address */}
                <section className="checkout-section" aria-labelledby="delivery-address-heading">
                  <div className="checkout-section-header">
                    <h2 id="delivery-address-heading" className="checkout-section-title">
                      <span className="checkout-section-step">2</span>
                      Delivery address
                    </h2>
                  </div>

                  {/* Country (Preselected India) */}
                  <div className="checkout-group">
                    <label htmlFor="country" className="checkout-label">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={values.country}
                      readOnly
                      className="checkout-input bg-sand/40 text-soft cursor-not-allowed font-medium"
                    />
                  </div>

                  {/* House / Flat / Building */}
                  <div className="checkout-group">
                    <label htmlFor="addressLine1" className="checkout-label">
                      House / Flat / Building <span className="text-fox">*</span>
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      name="addressLine1"
                      autoComplete="address-line1"
                      value={values.addressLine1}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={Boolean(errors.addressLine1 && touched.addressLine1)}
                      aria-describedby={errors.addressLine1 && touched.addressLine1 ? 'addressLine1-error' : undefined}
                      className={`checkout-input ${
                        errors.addressLine1 && touched.addressLine1
                          ? 'checkout-input--error'
                          : ''
                      }`}
                      placeholder="Flat 4B, Silver Oak Residences"
                    />
                    {touched.addressLine1 && (
                      <InlineFieldError id="addressLine1-error" message={errors.addressLine1} />
                    )}
                  </div>

                  {/* Street / Area */}
                  <div className="checkout-group">
                    <label htmlFor="addressLine2" className="checkout-label">
                      Street / Area <span className="text-fox">*</span>
                    </label>
                    <input
                      type="text"
                      id="addressLine2"
                      name="addressLine2"
                      autoComplete="address-line2"
                      value={values.addressLine2}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={Boolean(errors.addressLine2 && touched.addressLine2)}
                      aria-describedby={errors.addressLine2 && touched.addressLine2 ? 'addressLine2-error' : undefined}
                      className={`checkout-input ${
                        errors.addressLine2 && touched.addressLine2
                          ? 'checkout-input--error'
                          : ''
                      }`}
                      placeholder="12th Main, 4th Block, Indiranagar"
                    />
                    {touched.addressLine2 && (
                      <InlineFieldError id="addressLine2-error" message={errors.addressLine2} />
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* City */}
                    <div className="checkout-group">
                      <label htmlFor="city" className="checkout-label">
                        City <span className="text-fox">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        autoComplete="address-level2"
                        value={values.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-invalid={Boolean(errors.city && touched.city)}
                        aria-describedby={errors.city && touched.city ? 'city-error' : undefined}
                        className={`checkout-input ${
                          errors.city && touched.city
                            ? 'checkout-input--error'
                            : ''
                        }`}
                        placeholder="Bengaluru"
                      />
                      {touched.city && (
                        <InlineFieldError id="city-error" message={errors.city} />
                      )}
                    </div>

                    {/* State */}
                    <div className="checkout-group">
                      <label htmlFor="state" className="checkout-label">
                        State <span className="text-fox">*</span>
                      </label>
                      <select
                        id="state"
                        name="state"
                        autoComplete="address-level1"
                        value={values.state}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-invalid={Boolean(errors.state && touched.state)}
                        aria-describedby={errors.state && touched.state ? 'state-error' : undefined}
                        className={`checkout-input ${
                          errors.state && touched.state
                            ? 'checkout-input--error'
                            : ''
                        }`}
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {touched.state && (
                        <InlineFieldError id="state-error" message={errors.state} />
                      )}
                    </div>

                    {/* PIN code */}
                    <div className="checkout-group">
                      <label htmlFor="pincode" className="checkout-label">
                        PIN code <span className="text-fox">*</span>
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        autoComplete="postal-code"
                        maxLength={6}
                        value={values.pincode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-invalid={Boolean(errors.pincode && touched.pincode)}
                        aria-describedby={errors.pincode && touched.pincode ? 'pincode-error' : undefined}
                        className={`checkout-input ${
                          errors.pincode && touched.pincode
                            ? 'checkout-input--error'
                            : ''
                        }`}
                        placeholder="560038"
                      />
                      {touched.pincode && (
                        <InlineFieldError id="pincode-error" message={errors.pincode} />
                      )}
                    </div>
                  </div>
                </section>

                {/* SECTION 3: Delivery options */}
                <section className="checkout-section" aria-labelledby="delivery-method-heading">
                  <div className="checkout-section-header">
                    <h2 id="delivery-method-heading" className="checkout-section-title">
                      <span className="checkout-section-step">3</span>
                      Delivery option
                    </h2>
                  </div>

                  <div className="delivery-option-card delivery-option-card--active">
                    <input
                      type="radio"
                      id="standard-delivery"
                      name="deliveryMethod"
                      defaultChecked
                      className="mt-1 accent-ink"
                    />
                    <label htmlFor="standard-delivery" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-sm font-bold uppercase tracking-wide text-ink">
                          Standard Delivery
                        </span>
                        <span className={`text-xs font-semibold ${isFree ? 'text-emerald-700' : 'text-ink'}`}>
                          {displayFee} ({PROVISIONAL_SHIPPING_POLICY.deliveryTimeline})
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-soft">
                        {isFree
                          ? `Qualifies for free delivery (subtotal ₹${subtotal.toLocaleString('en-IN')} meets ₹1,499 free shipping threshold).`
                          : `Tracked doorstep delivery across India (free on orders of ₹1,499 or above).`}
                      </p>
                    </label>
                  </div>
                </section>

                {/* Submit CTA */}
                <div className="pt-6">
                  <button type="submit" className="checkout-submit-btn">
                    <span>CONTINUE TO PAYMENT</span>
                    <ArrowRight size={15} />
                  </button>
                  <p className="mt-3 text-center text-[11px] text-soft">
                    Step 1 of 3 • You will choose your payment method on the next screen
                  </p>
                </div>
              </form>
            )}

            {/* STAGE 2: PAYMENT SELECTION */}
            {stage === 'payment' && (
              <form onSubmit={handleProceedToReview} noValidate>
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
                      HOW WOULD YOU LIKE TO PAY?
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-soft">
                      Choose an available payment method to continue with your checkout preview.
                    </p>
                  </div>

                  {/* Honesty / Preview Banner */}
                  <div className="rounded-xl border border-line bg-sand/50 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={20} className="text-fox shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                          Demonstration Storefront Preview
                        </h3>
                        <p className="mt-1 text-xs text-soft leading-relaxed">
                          Payment gateway integration will be active at store launch.
                          Select your preferred method below to preview the order review. No real card numbers,
                          CVV, or UPI PINs are ever asked or charged.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Options Radio List */}
                  <div className="space-y-3" role="radiogroup" aria-label="Payment method">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = selectedPaymentMethod === method.id
                      return (
                        <label
                          key={method.id}
                          className={`checkout-payment-card ${
                            isSelected ? 'checkout-payment-card--active' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={isSelected}
                            onChange={() => setSelectedPaymentMethod(method.id)}
                            className="mt-1 accent-fox"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {method.icon}
                                <span className="font-display text-sm font-bold uppercase tracking-wide text-ink">
                                  {method.title}
                                </span>
                              </div>
                              {method.badge && (
                                <span className="rounded bg-fox/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fox">
                                  {method.badge}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-soft">
                              {method.subtitle}
                            </p>
                          </div>
                        </label>
                      )
                    })}
                  </div>

                  {/* Navigation CTAs */}
                  <div className="pt-6 space-y-3">
                    <button type="submit" className="checkout-submit-btn">
                      <span>CONTINUE TO REVIEW</span>
                      <ArrowRight size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStage('delivery')}
                      className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider text-soft hover:text-ink transition-colors"
                    >
                      <ArrowLeft size={14} />
                      <span>Back to Delivery Details</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STAGE 3: FINAL REVIEW & SLIDE COMMIT */}
            {stage === 'review' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
                    FINAL ORDER REVIEW
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-soft">
                    Please verify your delivery address and items before completing this preview.
                  </p>
                </div>

                {/* Delivery Summary Card */}
                <div className="checkout-review-card">
                  <div className="flex items-start justify-between gap-4 border-b border-line pb-3">
                    <div className="flex items-center gap-2">
                      <Truck size={18} className="text-fox" />
                      <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                        Delivery Details
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStage('delivery')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-fox hover:text-fox-deep"
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="pt-3 text-xs text-soft space-y-1">
                    <p className="font-bold text-ink">{values.fullName}</p>
                    <p>{values.addressLine1}, {values.addressLine2}</p>
                    <p>{values.city}, {values.state} – {values.pincode}</p>
                    <p className="pt-1 text-[11px]">Phone: {values.phone} • Email: {values.email}</p>
                  </div>
                </div>

                {/* Payment Summary Card */}
                <div className="checkout-review-card">
                  <div className="flex items-start justify-between gap-4 border-b border-line pb-3">
                    <div className="flex items-center gap-2">
                      {selectedPaymentObj?.icon || <Smartphone size={18} className="text-fox" />}
                      <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                        Payment Method
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStage('payment')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-fox hover:text-fox-deep"
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="pt-3 text-xs text-soft">
                    <p className="font-bold text-ink">
                      {selectedPaymentObj?.title || 'UPI (Instant Preview)'}
                    </p>
                    <p className="mt-0.5 text-[11px]">
                      {selectedPaymentObj?.subtitle}
                    </p>
                  </div>
                </div>

                {/* Demo Confirmation Notice */}
                <div className="rounded-xl border border-line bg-sand/30 p-4">
                  <p className="text-xs text-soft leading-relaxed">
                    <strong className="text-ink">Demonstration Order:</strong> Sliding the button below will confirm your checkout preview and generate a verified demonstration receipt. No genuine banking transaction will take place.
                  </p>
                </div>

                {/* Slide to Confirm Interaction */}
                <div className="pt-4 flex flex-col items-center">
                  <div className="w-full max-w-[340px]">
                    <SlideCommit
                      label="Slide to confirm preview"
                      doneLabel="Preview verified"
                      trackColor="#191919"
                      handleColor="#FFFFFF"
                      successColor="#E87535"
                      width={340}
                      height={54}
                      radius={27}
                      onConfirm={handleFinalOrderConfirm}
                    />
                  </div>

                  <p className="mt-3 text-center text-[11px] text-soft">
                    Slide right to authorise the order demonstration
                  </p>

                  <button
                    type="button"
                    onClick={() => setStage('payment')}
                    className="mt-4 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider text-soft hover:text-ink transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Payment</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <aside className="checkout-summary-column" aria-label="Order summary">
            <div className="checkout-summary-box">
              <div className="flex items-baseline justify-between border-b border-line pb-4">
                <h2 className="font-display text-base font-black uppercase tracking-wider text-ink">
                  Order Summary
                </h2>
                <Link
                  to="/cart"
                  className="text-xs font-semibold uppercase tracking-wider text-soft hover:text-fox underline underline-offset-4 transition-colors"
                >
                  Edit bag
                </Link>
              </div>

              {/* Mini Item List */}
              <ul
                aria-label="Items in order"
                className="divide-y divide-line max-h-[380px] overflow-y-auto pr-1 my-2"
              >
                {cartItems.map((item) => {
                  const product = products.find((p) => p.id === item.id)
                  if (!product) return null
                  const itemKey = `${item.id}-${item.size}-${item.color}`
                  const itemLineTotal = product.price * item.qty

                  return (
                    <li key={itemKey} className="checkout-summary-item">
                      <img
                        src={product.image}
                        alt={product.alt}
                        className="checkout-summary-item-img"
                        width="64"
                        height="85"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = getCategoryFallbackImage(product.category)
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-xs font-bold uppercase tracking-wide text-ink truncate">
                          {product.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-soft">
                          <span>{item.color}</span>
                          <span className="mx-1.5">•</span>
                          <span>Size {item.size}</span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-soft">
                          Qty: <span className="font-semibold text-ink">{item.qty}</span>
                        </p>
                        <p className="mt-1 font-display text-xs font-bold text-ink">
                          {formatPrice(itemLineTotal)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {/* Calculation Rows */}
              <div className="mt-4 border-t border-line pt-4 space-y-3 text-xs text-soft">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">Order subtotal</span>
                  <span className="font-bold text-ink">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>Shipping</span>
                    {isProvisional && (
                      <span className="rounded border border-line bg-sand px-1.5 py-0.5 text-[9px] font-semibold text-soft tracking-wider uppercase">
                        Provisional
                      </span>
                    )}
                  </div>
                  <span className={`font-semibold ${isFree ? 'text-emerald-700' : 'text-ink'}`}>
                    {displayFee}
                  </span>
                </div>
              </div>

              {/* Total Row */}
              <div className="mt-4 border-t border-line pt-4 flex items-baseline justify-between">
                <div>
                  <span className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                    Total
                  </span>
                  <p className="text-[10px] text-soft">
                    Includes all applicable taxes
                  </p>
                </div>
                <span className="font-display text-xl font-extrabold text-ink sm:text-2xl">
                  {formatPrice(orderTotal)}
                </span>
              </div>

              {/* Trust Features */}
              <div className="mt-6 border-t border-line pt-4 space-y-2 text-[11px] text-soft">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-fox shrink-0" />
                  <span>3–5 business day standard delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-fox shrink-0" />
                  <span>Safe &amp; secure demonstration checkout</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  )
}
