import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Tag,
  Check,
  X,
  AlertCircle,
} from 'lucide-react'
import { products, formatPrice, getCategoryFallbackImage, type Product } from '../data/products'
import { calculateShipping, PROVISIONAL_SHIPPING_POLICY } from '../config/shipping'
import { CouponService, CouponValidationResult } from '../services/api'
import { showToast } from '../utils/toast'
import { EmptyState } from './feedback'
import Footer from './Footer'
import './CartPage.css'

export interface CartItem {
  id: string
  size: string
  color: string
  qty: number
}

interface CartPageProps {
  cartItems: CartItem[]
  onUpdateQuantity: (id: string, size: string, color: string, newQty: number) => void
  onRemoveItem: (id: string, size: string, color: string) => void
}

export default function CartPage({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
}: CartPageProps) {
  const navigate = useNavigate()

  // Calculate total items and subtotal
  const totalItems = React.useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.qty, 0)
  }, [cartItems])

  const subtotal = React.useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.id)
      return acc + (product?.price || 0) * item.qty
    }, 0)
  }, [cartItems])

  const { isFree, amountNeededForFree, shippingFee } = calculateShipping(subtotal)

  // Promo code engine state
  const [couponCode, setCouponCode] = React.useState('')
  const [appliedCoupon, setAppliedCoupon] = React.useState<CouponValidationResult | null>(() => {
    try {
      const saved = sessionStorage.getItem('funky-fox-coupon')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [couponLoading, setCouponLoading] = React.useState(false)
  const [couponError, setCouponError] = React.useState('')

  const handleApplyCoupon = async (codeToTry?: string) => {
    const code = (codeToTry || couponCode).trim()
    if (!code) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const result = await CouponService.applyCoupon(code, subtotal)
      setAppliedCoupon(result)
      setCouponCode('')
      sessionStorage.setItem('funky-fox-coupon', JSON.stringify(result))
      showToast(`Coupon ${result.code} applied: You saved ₹${result.discountAmount}!`, {
        type: 'success',
      })
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code.')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError('')
    sessionStorage.removeItem('funky-fox-coupon')
    showToast('Coupon removed.', { type: 'info' })
  }

  // Recalculate discount and final shipping
  const discountAmount = appliedCoupon && appliedCoupon.discountType !== 'free_shipping' ? appliedCoupon.discountAmount : 0
  const effectiveShipping = (appliedCoupon && appliedCoupon.discountType === 'free_shipping') || isFree ? 0 : shippingFee
  const finalTotal = Math.max(0, subtotal - discountAmount + effectiveShipping)

  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="pt-6 sm:pt-8 text-xs font-medium text-soft">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link to="/#home" className="hover:text-fox transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink font-semibold" aria-current="page">
              Shopping Bag
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <header className="border-b border-line pb-6 pt-6 sm:pb-8 sm:pt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[.3em] text-soft sm:text-[10.5px]">
                <span aria-hidden="true" className="h-[3px] w-6 rounded-full bg-fox" />
                Review &amp; Edit
              </p>
              <h1 className="mt-2.5 font-display text-3xl font-black uppercase leading-none tracking-[-0.035em] text-ink sm:text-4xl lg:text-5xl">
                YOUR BAG.
              </h1>
            </div>

            {totalItems > 0 && (
              <p className="text-xs font-bold uppercase tracking-wider text-soft sm:mb-1">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your bag
              </p>
            )}
          </div>
        </header>

        {/* Content Section */}
        {cartItems.length > 0 ? (
          <div className="cart-layout">
            {/* LEFT COLUMN: Cart Items */}
            <div className="flex flex-col">
              {/* Free Shipping Progress Notice */}
              <div className="flex items-center gap-2.5 rounded border border-line bg-sand/50 px-4 py-3 text-xs font-semibold text-ink mb-2">
                <Truck size={16} className="text-fox shrink-0" />
                <span>
                  {isFree
                    ? 'Nice — your order qualifies for free delivery across India!'
                    : `Add ${formatPrice(amountNeededForFree)} more for free delivery.`}
                </span>
              </div>

              {/* Items List */}
              <ul aria-label="Items in your bag" className="divide-y divide-line">
                {cartItems.map((item) => {
                  const product = products.find((p) => p.id === item.id)
                  if (!product) return null

                  const itemKey = `${item.id}-${item.size}-${item.color}`
                  const itemLineTotal = product.price * item.qty

                  return (
                    <li className="cart-item" key={itemKey}>
                      {/* Product Thumbnail */}
                      <Link
                        to={`/products/${product.id}`}
                        className="cart-item-image-wrap"
                        aria-label={`View ${product.name}`}
                      >
                        <img
                          src={product.image}
                          alt={product.alt}
                          className="cart-item-image"
                          width="240"
                          height="320"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = getCategoryFallbackImage(product.category)
                          }}
                        />
                      </Link>

                      {/* Product Details & Controls */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          {/* Title & Line Price */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
                            <Link
                              to={`/products/${product.id}`}
                              className="font-display text-sm font-bold uppercase tracking-wide text-ink hover:text-fox transition-colors sm:text-base"
                            >
                              {product.name}
                            </Link>
                            <span className="font-display text-sm font-extrabold text-ink sm:text-base shrink-0">
                              {formatPrice(itemLineTotal)}
                            </span>
                          </div>

                          {/* Variant Details */}
                          <p className="mt-1 text-xs text-soft">
                            Colour: <span className="font-medium text-ink">{item.color}</span>
                            <span className="mx-2">•</span>
                            Size: <span className="font-bold text-ink">{item.size}</span>
                          </p>

                          {/* Unit Price */}
                          <p className="mt-0.5 text-[11.5px] text-soft">
                            {formatPrice(product.price)} each
                          </p>
                        </div>

                        {/* Bottom Row: Quantity Controls & Remove */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-line bg-paper h-9">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${product.name}`}
                              disabled={item.qty <= 1}
                              onClick={() =>
                                onUpdateQuantity(
                                  item.id,
                                  item.size,
                                  item.color,
                                  item.qty - 1
                                )
                              }
                              className="px-2.5 h-full text-ink hover:bg-sand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Minus size={13} />
                            </button>
                            <span
                              className="min-w-[2rem] text-center text-xs font-bold text-ink"
                              aria-label={`Quantity: ${item.qty}`}
                            >
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase quantity of ${product.name}`}
                              onClick={() =>
                                onUpdateQuantity(
                                  item.id,
                                  item.size,
                                  item.color,
                                  item.qty + 1
                                )
                              }
                              className="px-2.5 h-full text-ink hover:bg-sand transition-colors"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          {/* Remove Action */}
                          <button
                            type="button"
                            onClick={() =>
                              onRemoveItem(item.id, item.size, item.color)
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-soft hover:text-fox transition-colors"
                            aria-label={`Remove ${product.name} (${item.color}, size ${item.size}) from bag`}
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {/* Bottom Continue Shopping Link */}
              <div className="pt-6 hidden sm:block">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink hover:text-fox transition-colors"
                >
                  <ArrowRight size={14} className="rotate-180" />
                  Continue Browsing More Fits
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary Box */}
            <div className="cart-summary-box">
              <h2 className="font-display text-sm font-black uppercase tracking-[.15em] text-ink border-b border-line pb-4">
                Order Summary
              </h2>

              <div className="mt-5 space-y-3 text-xs text-soft">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">Subtotal</span>
                  <span className="font-bold text-ink">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Discount Row (If Coupon Applied) */}
                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <span className="font-semibold flex items-center gap-1">
                      <Tag size={12} /> Discount ({appliedCoupon.code})
                    </span>
                    <span className="font-bold">
                      - {formatPrice(discountAmount)}
                    </span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className={`text-right font-medium ${effectiveShipping === 0 ? 'text-emerald-700 font-semibold' : 'text-soft'}`}>
                    {effectiveShipping === 0 ? 'FREE' : `${formatPrice(effectiveShipping)} (standard)`}
                  </span>
                </div>
              </div>

              {/* PROMO CODE INPUT & BADGES */}
              <div className="mt-5 border-t border-line pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink mb-2 flex items-center gap-1.5">
                  <Tag size={13} className="text-fox" /> Have a Promo Code?
                </p>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-sand-deep/40 border border-fox/30 rounded-xl p-2.5 text-xs">
                    <div>
                      <span className="font-bold text-fox tracking-wider uppercase">{appliedCoupon.code}</span>
                      <p className="text-[10.5px] text-soft">{appliedCoupon.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleApplyCoupon()
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. FOX10"
                        className="flex-1 h-9 rounded-lg border border-line bg-white px-3 text-xs font-bold uppercase text-ink outline-none focus:border-fox"
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !couponCode.trim()}
                        className="h-9 px-3.5 rounded-lg bg-ink text-white text-xs font-bold uppercase hover:bg-neutral-800 disabled:opacity-40"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </form>

                    {couponError && (
                      <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {couponError}
                      </p>
                    )}

                    {/* Quick Coupon Chips */}
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-soft font-medium">Try:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('FOX10')}
                        className="px-2 py-0.5 rounded-full border border-line bg-white hover:border-fox text-[10px] font-bold text-ink"
                      >
                        FOX10 (10% off)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('FIRSTDROP')}
                        className="px-2 py-0.5 rounded-full border border-line bg-white hover:border-fox text-[10px] font-bold text-ink"
                      >
                        FIRSTDROP (₹200 off)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Row */}
              <div className="mt-5 border-t border-line pt-4 flex items-baseline justify-between">
                <span className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                  Total
                </span>
                <div className="text-right">
                  <span className="font-display text-xl font-extrabold text-ink sm:text-2xl">
                    {formatPrice(finalTotal)}
                  </span>
                  <p className="text-[10.5px] text-soft">
                    Includes all applicable taxes
                  </p>
                </div>
              </div>

              {/* Continue to Checkout Button */}
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-fox px-6 text-xs font-bold uppercase tracking-[.18em] text-white transition-colors hover:bg-fox-deep shadow-sm active:scale-[0.99]"
              >
                <span>CONTINUE TO CHECKOUT</span>
                <ArrowRight size={15} />
              </button>

              {/* Continue Shopping Link */}
              <Link
                to="/products"
                className="mt-4 block w-full text-center text-xs font-bold uppercase tracking-wider text-ink underline underline-offset-4 hover:text-fox transition-colors"
              >
                CONTINUE SHOPPING
              </Link>

              {/* Storefront Guarantees */}
              <div className="mt-6 border-t border-line pt-5 space-y-2.5 text-[11.5px] text-soft">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-fox shrink-0" />
                  <span>Secure checkout &amp; guaranteed authenticity</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={15} className="text-fox shrink-0" />
                  <span>15-day doorstep returns &amp; exchanges</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 6. EMPTY-CART STATE */
          <EmptyState
            icon={<ShoppingBag size={32} strokeWidth={1.5} />}
            heading="YOUR BAG IS EMPTY."
            message="You haven't added anything yet. Explore the collection to find your everyday favourites."
            primaryAction={{
              label: 'EXPLORE COLLECTION',
              to: '/products',
            }}
          />
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
