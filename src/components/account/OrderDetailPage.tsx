import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  MessageSquare,
  AlertTriangle,
  Receipt,
  MapPin,
  CreditCard,
  Package,
  HelpCircle
} from 'lucide-react';
import {
  getDemoOrderById,
  cancelDemoOrder,
  Order
} from '../../data/accountMockData';
import { formatPrice } from '../../data/products';
import './AccountStyles.css';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = React.useState<Order | null | undefined>(undefined);
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('Changed my mind');
  const [cancelError, setCancelError] = React.useState('');
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = React.useState('');

  const loadOrder = React.useCallback(() => {
    if (!orderId) {
      setOrder(null);
      return;
    }
    const found = getDemoOrderById(orderId);
    setOrder(found || null);
  }, [orderId]);

  React.useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (order === undefined) {
    return <div className="p-8 text-center text-xs text-neutral-500">Loading order details...</div>;
  }

  // Not Found State
  if (order === null) {
    return (
      <div className="py-16 text-center border border-dashed border-[#E8E5DF] rounded-2xl bg-[#FAF9F6] p-8">
        <Package size={40} className="mx-auto text-neutral-400 mb-3" />
        <h2 className="font-display text-xl font-bold uppercase text-ink">Order Not Found</h2>
        <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
          We could not locate an order matching ID <span className="font-mono text-ink">"{orderId}"</span>.
        </p>
        <Link
          to="/account/orders"
          className="mt-5 inline-flex items-center gap-2 py-2 px-5 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft size={14} /> Back to My Orders
        </Link>
      </div>
    );
  }

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCancelError('');
    setIsCancelling(true);

    setTimeout(() => {
      const res = cancelDemoOrder(order.id, cancelReason);
      setIsCancelling(false);
      if (res.success) {
        setIsCancelModalOpen(false);
        setCancelSuccessMsg('Order successfully cancelled. Refund initiated to original payment source.');
        loadOrder();
      } else {
        setCancelError(res.error || 'Failed to cancel order.');
      }
    }, 400);
  };

  // Stepper logic matching Image 1
  const steps = [
    { label: 'Order Placed', key: 'placed' },
    { label: 'Order Paid', key: 'paid' },
    { label: 'Order Shipped Out', key: 'shipped' },
    { label: 'To Receive', key: 'delivered' },
    { label: 'To Rate', key: 'rated' }
  ];

  const getStepProgressIndex = () => {
    if (order.status === 'cancelled') return 0;
    if (order.status === 'processing') return 1;
    if (order.status === 'shipped') return 2;
    if (order.status === 'delivered') return 4;
    return 1;
  };

  const activeIndex = getStepProgressIndex();

  return (
    <div className="space-y-6">
      {/* Top Bar matching Image 1 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0ECE1] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/account/orders"
            className="p-1.5 rounded-full hover:bg-[#FAF9F6] text-neutral-600 hover:text-ink transition-colors"
            title="Back to all orders"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-display text-2xl font-black text-ink">
            Order Details
          </h1>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-neutral-400">Order ID:</span>{' '}
          <span className="font-mono text-sm font-bold text-ink">{order.orderNumber}</span>
        </div>
      </div>

      {cancelSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-600" />
            <span>{cancelSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setCancelSuccessMsg('')}
            className="text-green-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left Receipt Card vs Right Tracking & Timeline (Image 1 Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Your Order Receipt Card */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="fox-order-receipt-card shadow-xs">
            <h3 className="font-display text-base font-black text-ink border-b border-[#E8E5DF] pb-3">
              Your Order
            </h3>

            {/* Ordered Products */}
            <div className="py-4 space-y-4 border-b border-[#E8E5DF]">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded-md border border-[#E8E5DF] bg-white shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = '/images/product-tshirt.webp';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-ink leading-snug">{item.name}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {item.color} · Size {item.size}
                    </p>
                    <p className="text-[11px] text-neutral-500">{item.quantity} item{item.quantity > 1 ? 's' : ''}</p>
                    <p className="text-xs font-bold text-ink mt-1.5">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Itemized Price Breakdown */}
            <div className="py-4 space-y-2 border-b border-[#E8E5DF] text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-ink">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="font-semibold text-green-700">
                  {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Estimated Tax (GST)</span>
                <span className="font-semibold text-ink">{formatPrice(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#E87535] font-semibold">
                  <span>Discount ({order.discountCode || 'Promo'})</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="py-4 border-b border-[#E8E5DF] flex justify-between items-center">
              <span className="text-sm font-bold text-ink">Total</span>
              <span className="font-display text-lg font-black text-ink">{formatPrice(order.total)}</span>
            </div>

            {/* Note if available */}
            {order.note && (
              <div className="py-3 border-b border-[#E8E5DF] text-xs">
                <span className="font-bold text-neutral-700 block">Note:</span>
                <p className="text-neutral-500 italic mt-0.5">{order.note}</p>
              </div>
            )}

            {/* Payment Info */}
            <div className="pt-4 text-xs">
              <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Payment Information
              </span>
              <p className="font-semibold text-ink">{order.paymentMethod.type}</p>
              <p className="text-neutral-500 font-mono">**** {order.paymentMethod.last4}</p>
              <p className="text-[11px] text-green-700 font-semibold mt-1">Status: {order.paymentMethod.status}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline, Delivery ETA, Support & Tracking Details */}
        <div className="lg:col-span-8 order-1 lg:order-2 space-y-6">
          {/* Horizontal Step Timeline (Image 1 Style) */}
          <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="fox-order-stepper">
              <div className="fox-order-stepper-line" />
              <div
                className="fox-order-stepper-progress"
                style={{ width: `${(activeIndex / (steps.length - 1)) * 90}%` }}
              />

              {steps.map((st, i) => {
                const isCompleted = i <= activeIndex;
                const isCurrent = i === activeIndex;

                return (
                  <div key={st.key} className="fox-order-step-node">
                    <div
                      className={`fox-order-step-circle ${
                        isCurrent
                          ? 'fox-order-step-circle--active'
                          : isCompleted
                          ? 'fox-order-step-circle--completed'
                          : ''
                      }`}
                    >
                      {i === 0 && <Receipt size={16} />}
                      {i === 1 && <CreditCard size={16} />}
                      {i === 2 && <Truck size={16} />}
                      {i === 3 && <Package size={16} />}
                      {i === 4 && <CheckCircle2 size={16} />}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-ink mt-2 leading-tight">
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Delivery Attempt Notification */}
            <div className="mt-6 pt-5 border-t border-[#E8E5DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Delivery Window
                </p>
                <p className="font-display text-base font-black text-ink mt-0.5">
                  {order.status === 'delivered'
                    ? 'Delivered on ' + order.estimatedDelivery
                    : order.status === 'cancelled'
                    ? 'Order Cancelled'
                    : 'Delivery attempt expected by ' + order.estimatedDelivery}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Confirm receipt after inspecting your garments.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <Link
                  to="/help"
                  className="py-2.5 px-4 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 w-full sm:w-auto"
                >
                  <MessageSquare size={14} /> Chat Support
                </Link>

                {/* Cancel Action if Processing */}
                {order.status === 'processing' && (
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="py-2.5 px-4 rounded-full border border-red-300 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors w-full sm:w-auto"
                  >
                    Cancel Order
                  </button>
                )}

                {/* Return Action if Delivered */}
                {order.status === 'delivered' && (
                  <Link
                    to="/help"
                    className="py-2.5 px-4 rounded-full border border-[#E8E5DF] bg-white text-ink text-xs font-bold uppercase tracking-wider hover:border-ink transition-colors w-full sm:w-auto text-center"
                  >
                    15-Day Return / Exchange
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address & Detailed Vertical Milestones (Images 1 & 2 Style) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Delivery Address */}
            <div className="md:col-span-5 border border-[#E8E5DF] rounded-2xl p-5 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-[#E87535]" />
                <h3 className="font-display text-sm font-black uppercase text-ink">
                  Delivery Address
                </h3>
              </div>
              <div className="text-xs text-neutral-600 space-y-1">
                <p className="font-bold text-ink text-sm">{order.deliveryAddress.fullName}</p>
                <p>{order.deliveryAddress.phone}</p>
                <p className="leading-relaxed">{order.deliveryAddress.street}</p>
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</p>
                <p>{order.deliveryAddress.country}</p>
              </div>

              {order.carrier && (
                <div className="mt-4 pt-3 border-t border-[#F0ECE1] text-xs">
                  <span className="font-bold text-neutral-400 block text-[10px] uppercase">Courier Partner</span>
                  <p className="font-semibold text-ink">{order.carrier.name}</p>
                  <p className="font-mono text-neutral-500 mt-0.5">Tracking: {order.carrier.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Vertical Milestones Timeline (Image 2 Northwind Style) */}
            <div className="md:col-span-7 border border-[#E8E5DF] rounded-2xl p-5 bg-white">
              <h3 className="font-display text-sm font-black uppercase text-ink mb-4 pb-2 border-b border-[#F0ECE1]">
                Live Status Log
              </h3>

              <div className="fox-vertical-timeline">
                {order.timeline.map((mile, i) => (
                  <div key={i} className="fox-milestone-item">
                    <div
                      className={`fox-milestone-dot ${
                        mile.current
                          ? 'fox-milestone-dot--current'
                          : mile.completed
                          ? 'fox-milestone-dot--completed'
                          : ''
                      }`}
                    >
                      {mile.completed && <CheckCircle2 size={10} />}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-ink">{mile.label}</p>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {mile.date} {mile.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      {mile.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8E5DF] max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <AlertTriangle size={24} />
              <h3 className="font-display text-lg font-black uppercase text-ink">
                Cancel Order {order.orderNumber}?
              </h3>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Your order is currently processing and can be cancelled immediately without penalty. A full refund of <span className="font-bold text-ink">{formatPrice(order.total)}</span> will be reversed to your original payment method.
            </p>

            {cancelError && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">
                {cancelError}
              </div>
            )}

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:border-ink focus:outline-none"
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Selected wrong size or color">Selected wrong size or color</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Need to change delivery address">Need to change delivery address</option>
                  <option value="Found a different garment">Found a different garment</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="py-2 px-4 rounded-full border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="py-2 px-4 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-xs"
                >
                  {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

