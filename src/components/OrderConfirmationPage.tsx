import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { formatPrice } from '../data/products'
import { EmptyState, OrderConfirmation } from './feedback'
import Footer from './Footer'

export default function OrderConfirmationPage() {
  const location = useLocation()
  const orderData = location.state as {
    orderReference?: string
    customerName?: string
    customerEmail?: string
    deliveryCity?: string
    deliveryState?: string
    deliveryPincode?: string
    orderTotal?: number
    paymentMethod?: string
    itemsCount?: number
  } | null

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink">
      {/* Top Header */}
      <header className="border-b border-line bg-paper/95 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[72px] lg:px-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-soft hover:text-fox transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Shop</span>
          </Link>
          <Link
            to="/#home"
            className="group flex items-baseline gap-1.5"
            aria-label="Funky Fox Home"
          >
            <span className="font-display text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
              FUNKY <span className="text-fox transition-colors group-hover:text-fox-deep">FOX</span>
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-fox transition-transform duration-200 group-hover:scale-125" />
          </Link>
          <div className="w-20" aria-hidden="true" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {orderData && orderData.customerName ? (
            <div className="space-y-6">
              <OrderConfirmation
                mode="preview"
                customerName={orderData.customerName}
                customerEmail={orderData.customerEmail || 'customer@example.com'}
                deliveryCity={orderData.deliveryCity || 'Bengaluru'}
                deliveryState={orderData.deliveryState || 'Karnataka'}
                deliveryPincode={orderData.deliveryPincode || '560001'}
                orderTotal={orderData.orderTotal}
                orderReference={orderData.orderReference}
                paymentStatus="Preview Authorized"
                deliveryStatus="Preview Ready"
              />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  to="/account/orders"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-md bg-ink text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-neutral-800"
                >
                  <Truck size={16} />
                  <span>Track in My Orders</span>
                </Link>
                <Link
                  to="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-md bg-fox text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-fox-deep"
                >
                  <ShoppingBag size={16} />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Safe Fallback when route is visited directly without an active order */
            <div className="rounded-xl border border-line bg-white p-8 sm:p-12 text-center shadow-xs">
              <EmptyState
                icon={<ShieldCheck size={28} className="text-soft" />}
                heading="NO VERIFIED ORDER FOUND"
                message="You have reached the confirmation page without an active order session. In this demonstration storefront, genuine orders and payment processing will be enabled at official store launch."
                primaryAction={{
                  label: 'EXPLORE SHOP',
                  to: '/products',
                }}
                secondaryAction={{
                  label: 'GO TO HOMEPAGE',
                  to: '/',
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

