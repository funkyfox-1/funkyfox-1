import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Printer,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Send,
  AlertCircle,
  CreditCard,
  Ban,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { AdminOrder, OrderStatus } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../context/ToastContext';
import { Modal } from '../components/ui/Modal';

// Valid Order Lifecycle State Machine
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'delivered', 'returned'],
  out_for_delivery: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending Review',
  confirmed: 'Order Confirmed',
  processing: 'Processing in Warehouse',
  packed: 'Packed & Ready',
  shipped: 'Handed to Logistics',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered to Customer',
  cancelled: 'Order Cancelled',
  returned: 'Returned by Customer',
};

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAdminAuth();
  const { showToast } = useAdminToast();
  const navigate = useNavigate();

  const [order, setOrder] = React.useState<AdminOrder | undefined>(undefined);
  const [newNote, setNewNote] = React.useState('');
  const [transitionStatus, setTransitionStatus] = React.useState<OrderStatus | null>(null);
  const [transitionNote, setTransitionNote] = React.useState('');
  const [updating, setUpdating] = React.useState(false);

  const loadData = () => {
    if (!id) return;
    const found = storeService.getOrderById(id);
    setOrder(found);
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('funkyfox:store_updated', loadData);
    return () => window.removeEventListener('funkyfox:store_updated', loadData);
  }, [id]);

  if (!order) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200">
        <p className="text-sm text-zinc-500 font-semibold">Order record not found.</p>
        <Link to="/admin/orders" className="mt-3 inline-block text-xs font-bold text-[#FF6B35]">
          ← Back to Orders Registry
        </Link>
      </div>
    );
  }

  const allowedNextStatuses = VALID_TRANSITIONS[order.shippingStatus] || [];
  const isTerminal = allowedNextStatuses.length === 0;

  const handleConfirmTransition = async () => {
    if (!transitionStatus) return;
    setUpdating(true);

    try {
      const actorName = user?.name || 'Administrator';
      storeService.updateOrderStatus(order.id, transitionStatus, actorName);

      if (transitionNote.trim()) {
        storeService.addOrderNote(order.id, `Status transitioned to ${transitionStatus}: ${transitionNote.trim()}`, actorName);
      }

      showToast(`Order status updated to ${STATUS_LABELS[transitionStatus]}`, 'success');
      setTransitionStatus(null);
      setTransitionNote('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Status transition failed.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    storeService.addOrderNote(order.id, newNote.trim(), user?.name || 'Staff');
    setNewNote('');
    showToast('Internal note saved.', 'success');
    loadData();
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black uppercase tracking-tight text-zinc-900 font-display">
                Order {order.orderNumber}
              </h1>
              <Badge
                variant={
                  order.shippingStatus === 'delivered'
                    ? 'success'
                    : order.shippingStatus === 'shipped'
                    ? 'info'
                    : order.shippingStatus === 'cancelled'
                    ? 'error'
                    : 'warning'
                }
              >
                {STATUS_LABELS[order.shippingStatus] || order.shippingStatus}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrintInvoice}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={14} /> Print Invoice
          </button>

          {/* Action buttons for allowed lifecycle transitions */}
          {allowedNextStatuses.map((nextStatus) => (
            <button
              key={nextStatus}
              type="button"
              onClick={() => setTransitionStatus(nextStatus)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer ${
                nextStatus === 'cancelled'
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              {nextStatus === 'cancelled' ? <Ban size={13} /> : <ArrowRight size={13} />}
              <span>Mark as {STATUS_LABELS[nextStatus]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Items & Financials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Card */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Purchased Items ({order.items.length})
              </h2>
              <Badge variant={order.fulfillmentStatus === 'fulfilled' ? 'success' : 'warning'}>
                {order.fulfillmentStatus}
              </Badge>
            </div>

            <div className="divide-y divide-zinc-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-14 rounded-xl object-cover border border-zinc-200 bg-zinc-100 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">{item.name}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Color: <span className="font-semibold text-zinc-700">{item.color}</span> · Size:{' '}
                        <span className="font-semibold text-zinc-700">{item.size}</span>
                      </p>
                      <p className="text-[11px] font-mono text-zinc-400 mt-1">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">
                      ₹{item.price} × {item.quantity}
                    </p>
                    <p className="text-sm font-black text-zinc-900 mt-0.5">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="bg-zinc-50/70 p-6 border-t border-zinc-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Gross Subtotal</span>
                <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount Applied {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>-₹{Number(order.discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Freight / Delivery Fee</span>
                <span>{Number(order.shippingCharge) === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Standard GST Included (18%)</span>
                <span>₹{Number(order.tax).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-zinc-900 pt-2 border-t border-zinc-200">
                <span>Net Total Settled</span>
                <span>₹{Number(order.total).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Payment & Settlement Summary */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-[#FF6B35]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Payment Status & Settlement
                </h2>
              </div>
              <Badge
                variant={
                  order.paymentStatus === 'captured'
                    ? 'success'
                    : order.paymentStatus === 'pending'
                    ? 'warning'
                    : 'error'
                }
              >
                {order.paymentStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-zinc-400 block text-[11px]">Payment Mode</span>
                <span className="font-bold text-zinc-900 uppercase font-mono">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Settlement Status</span>
                <span className="font-semibold text-zinc-800">
                  {order.paymentStatus === 'captured' ? 'Fully Settled' : 'Pending Confirmation'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Transaction ID</span>
                <span className="font-mono text-zinc-800">
                  {order.paymentDetails?.transactionId || order.paymentDetails?.razorpayPaymentId || order.id}
                </span>
              </div>
            </div>
          </div>

          {/* Order Lifecycle Timeline */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-4">
              Lifecycle Event Ledger
            </h2>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-zinc-200">
              {order.timeline && order.timeline.length > 0 ? (
                order.timeline.map((event, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-8">
                    <div className="absolute left-1.5 top-1.5 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white border-2 border-[#FF6B35]" />
                    <div>
                      <p className="text-xs font-bold text-zinc-900">{event.label}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{event.description}</p>
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        {new Date(event.timestamp).toLocaleString('en-IN')}
                        {event.performedBy ? ` · by ${event.performedBy}` : ''}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="pl-8 text-xs text-zinc-400">Order created and registered.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Customer Details & Internal Notes */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <User size={18} className="text-zinc-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Customer Profile
              </h2>
            </div>

            <div className="text-xs space-y-1.5">
              <p className="font-bold text-zinc-900 text-sm">{order.customer.name}</p>
              <p className="text-zinc-600">{order.customer.email}</p>
              <p className="text-zinc-600">{order.customer.phone || 'Phone not provided'}</p>
            </div>

            <div className="pt-3 border-t border-zinc-100">
              <div className="flex items-center gap-1.5 text-zinc-700 font-semibold text-xs mb-1.5">
                <MapPin size={14} className="text-[#FF6B35]" />
                <span>Shipping Address</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.street}
                {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.pincode}
                <br />
                {order.shippingAddress.country}
              </p>
            </div>
          </div>

          {/* Internal Staff Notes */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Internal Staff Notes
            </h2>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {!order.internalNotes || order.internalNotes.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No operational notes recorded.</p>
              ) : (
                order.internalNotes.map((note, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 font-mono text-[11px]">
                    {note}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add warehouse note..."
                className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              />
              <button
                type="submit"
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Status Transition Confirmation Modal */}
      {transitionStatus && (
        <Modal
          isOpen={Boolean(transitionStatus)}
          onClose={() => setTransitionStatus(null)}
          title={`Confirm Order Status Transition: ${STATUS_LABELS[transitionStatus]}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 leading-relaxed">
              You are updating order <strong className="text-zinc-900">{order.orderNumber}</strong> from{' '}
              <Badge variant="warning">{order.shippingStatus}</Badge> to{' '}
              <Badge variant="info">{transitionStatus}</Badge>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Optional note or tracking memo
              </label>
              <textarea
                rows={2}
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
                placeholder="e.g. Dispatched via express courier, tracking ref #123456"
                className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white font-sans"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTransitionStatus(null)}
                className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTransition}
                disabled={updating}
                className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
              >
                {updating ? 'Updating...' : 'Confirm Transition'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
