import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getDemoOrders } from '../data/accountMockData'

export default function OrderConfirmationPage() {
  const location = useLocation()
  const orderData = location.state as {
    orderReference?: string
    orderId?: string
    customerName?: string
    customerEmail?: string
    deliveryCity?: string
    deliveryState?: string
    deliveryPincode?: string
    orderTotal?: number
    paymentMethod?: string
    itemsCount?: number
  } | null

  // Check if we have an active order from checkout navigation or latest confirmed demo order
  const existingOrders = React.useMemo(() => {
    try {
      return getDemoOrders()
    } catch {
      return []
    }
  }, [])

  const hasValidOrder = Boolean(
    orderData?.orderReference ||
    orderData?.orderId ||
    orderData?.customerName ||
    existingOrders.length > 0
  )

  const activeReference = orderData?.orderReference || (existingOrders.length > 0 ? existingOrders[0].orderNumber : null)

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen w-full bg-[#FBF8F1] flex flex-col items-center justify-between px-4 py-8 sm:py-12 selection:bg-[#f16c24]/20 selection:text-[#1c1d1a]">
      {/* Centered Top Brand Logo */}
      <header className="w-full pt-2 sm:pt-4 flex justify-center items-center">
        <Link
          to="/"
          className="group inline-flex items-baseline gap-1 text-2xl sm:text-3xl font-extrabold tracking-tight transition-transform duration-150 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f16c24] rounded-md px-2 py-1"
          aria-label="Funky Fox Home"
        >
          <span className="text-[#1c1d1a] font-sans font-black">Funky</span>
          <span className="text-[#f16c24] font-sans font-black italic">Fox</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center my-auto py-6 sm:py-10 text-center">
        {hasValidOrder ? (
          <>
            {/* Mascot Illustration extracted directly from reference */}
            <div className="relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[470px] mx-auto flex items-center justify-center">
              <img
                src="/images/order-success-mascot.png"
                alt="Funky Fox Order Confirmed"
                className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-xs"
                width={700}
                height={505}
                loading="eager"
              />
            </div>

            {/* Success Heading */}
            <h1 className="mt-6 sm:mt-8 font-sans text-3xl sm:text-4xl md:text-[42px] font-extrabold text-[#1c1d1a] tracking-tight leading-tight">
              Order Placed Successfully!
            </h1>

            {/* Supporting Message */}
            <div className="mt-3 sm:mt-4 space-y-1 text-sm sm:text-base md:text-lg text-[#4a4b48] font-normal leading-relaxed max-w-md mx-auto">
              <p>Thank you for shopping with Funky Fox.</p>
              <p>Your order has been confirmed and is now being processed.</p>
            </div>

            {/* Subtle order reference for reassurance */}
            {activeReference && (
              <p className="mt-2 text-xs font-medium text-[#7a7b78] tracking-wider uppercase">
                Order #{activeReference}
              </p>
            )}

            {/* Primary Action Button */}
            <div className="mt-8 sm:mt-10">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-[#1c1d19] hover:bg-[#2e2f2b] text-white text-sm sm:text-base font-semibold tracking-normal transition-all duration-200 shadow-sm active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1d19] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F1]"
              >
                <span>Continue Shopping</span>
                <span className="text-lg leading-none" aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </>
        ) : (
          /* Safe Fallback when visited directly with no active order */
          <div className="max-w-md mx-auto px-4 py-12 flex flex-col items-center">
            <h1 className="font-sans text-2xl sm:text-3xl font-bold text-[#1c1d1a] tracking-tight">
              No Active Order Found
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#4a4b48] leading-relaxed">
              You have reached the confirmation page without an active order session. Explore our catalog to find pieces for your wardrobe.
            </p>
            <Link
              to="/products"
              className="mt-8 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#1c1d19] hover:bg-[#2e2f2b] text-white text-sm font-semibold tracking-normal transition-all duration-200 shadow-sm active:scale-[0.98]"
            >
              <span>Explore Collection</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        )}
      </main>

      {/* Spacer to balance top header and maintain golden vertical proportion */}
      <footer className="w-full py-2 opacity-0 pointer-events-none select-none" aria-hidden="true">
        <span>Funky Fox</span>
      </footer>
    </div>
  )
}
