import * as React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ShieldCheck, Truck, ArrowRight, ArrowLeft } from 'lucide-react'
import { formatPrice } from '../../data/products'

export interface OrderConfirmationProps {
  /** Mode distinguishes frontend demonstration from production confirmed purchase */
  mode?: 'preview' | 'confirmed'
  customerName: string
  customerEmail: string
  deliveryCity: string
  deliveryState: string
  deliveryPincode: string
  orderTotal?: number
  orderReference?: string
  paymentStatus?: string
  deliveryStatus?: string
  onDismissPreview?: () => void
  className?: string
}

export default function OrderConfirmation({
  mode = 'preview',
  customerName,
  customerEmail,
  deliveryCity,
  deliveryState,
  deliveryPincode,
  orderTotal,
  orderReference,
  paymentStatus = 'Authorized',
  deliveryStatus = 'Processing',
  onDismissPreview,
  className = '',
}: OrderConfirmationProps) {
  const isPreview = mode === 'preview'

  return (
    <div
      role="region"
      aria-label={isPreview ? 'Checkout Preview Details' : 'Order Confirmation'}
      className={`rounded-2xl border ${
        isPreview ? 'border-fox/30 bg-sand/60' : 'border-emerald-700/30 bg-white'
      } p-6 sm:p-8 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
            isPreview ? 'bg-white text-fox border border-fox/20' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          <CheckCircle2 size={26} strokeWidth={2} aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[.25em] text-soft">
            {isPreview ? 'Storefront Prototype' : 'Order Confirmed'}
          </p>

          <h2 className="mt-1 font-display text-xl font-black uppercase text-ink sm:text-2xl">
            {isPreview
              ? 'Checkout preview — order placement will be available at launch'
              : `Order Placed Successfully: ${orderReference}`}
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-soft leading-relaxed">
            {isPreview ? (
              <>
                Thank you, <strong className="text-ink font-semibold">{customerName}</strong>!
                Your delivery details for{' '}
                <span className="text-ink font-medium">
                  {deliveryCity}, {deliveryState} ({deliveryPincode})
                </span>{' '}
                have been validated. Because this storefront is currently in demonstration mode, no payment was collected, no fake order was placed, and no charges have occurred.
              </>
            ) : (
              <>
                Thank you, <strong className="text-ink font-semibold">{customerName}</strong>.
                Your order is confirmed. A receipt has been dispatched to{' '}
                <strong className="text-ink font-semibold">{customerEmail}</strong>.
              </>
            )}
          </p>

          {/* Genuine order details card when confirmed */}
          {!isPreview && (
            <div className="mt-5 grid grid-cols-1 gap-3 rounded border border-line bg-sand/40 p-4 sm:grid-cols-3 text-xs">
              <div>
                <span className="text-soft block text-[11px]">Order Reference</span>
                <span className="font-mono font-bold text-ink">{orderReference}</span>
              </div>
              <div>
                <span className="text-soft block text-[11px]">Payment Status</span>
                <span className="font-semibold text-ink">{paymentStatus}</span>
              </div>
              <div>
                <span className="text-soft block text-[11px]">Fulfillment</span>
                <span className="font-semibold text-ink">{deliveryStatus}</span>
              </div>
              {orderTotal !== undefined && (
                <div className="sm:col-span-3 border-t border-line pt-2 mt-1 flex justify-between font-bold text-sm">
                  <span>Confirmed Total</span>
                  <span>{formatPrice(orderTotal)}</span>
                </div>
              )}
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-soft border-t border-line/60 pt-4">
            <div className="flex items-center gap-1.5">
              <Truck size={14} className="text-fox shrink-0" aria-hidden="true" />
              <span>3–5 business days standard delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-fox shrink-0" aria-hidden="true" />
              <span>{isPreview ? 'Zero-charge preview mode' : 'Guaranteed authenticity'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/products"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-fox px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-fox-deep transition-colors shadow-sm"
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} />
            </Link>

            {isPreview && onDismissPreview && (
              <button
                type="button"
                onClick={onDismissPreview}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-xs font-bold uppercase tracking-wider text-ink hover:bg-sand transition-colors"
              >
                <span>Edit Details</span>
              </button>
            )}

            <Link
              to="/cart"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-xs font-bold uppercase tracking-wider text-ink hover:bg-sand transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Return to Bag</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

