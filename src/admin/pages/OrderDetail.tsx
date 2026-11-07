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
  Truck,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { AdminOrder, OrderStatus } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../context/ToastContext';
import { Modal } from '../components/ui/Modal';
import { PrintableInvoice } from '../components/orders/PrintableInvoice';

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
  const [dispatching, setDispatching] = React.useState(false);
  const [dispatchError, setDispatchError] = React.useState<string | null>(null);
  const [copiedAwb, setCopiedAwb] = React.useState(false);
  const [refreshingTracking, setRefreshingTracking] = React.useState(false);
  const [showAllScans, setShowAllScans] = React.useState(false);
  const [showPrintModal, setShowPrintModal] = React.useState(false);

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

  const isCOD = order.paymentMethod?.toLowerCase() === 'cod';
  const isPaid = ['paid', 'captured'].includes(order.paymentStatus?.toLowerCase() || '');
  const isPrepaidPending = !isCOD && !isPaid;

  const handleShiprocketDispatch = async () => {
    if (!order) return;

    if (order.shipmentDetails?.awbCode) {
      showToast(`Order already manifested with AWB ${order.shipmentDetails.awbCode}`, 'info');
      return;
    }

    if (isPrepaidPending) {
      const msg = `Cannot dispatch prepaid order: payment status is "${order.paymentStatus}". Payment must be captured/paid before shipment.`;
      setDispatchError(msg);
      showToast(msg, 'error');
      return;
    }

    setDispatching(true);
    setDispatchError(null);

    try {
      const result = await storeService.dispatchShiprocket(order.id, user?.name || 'Administrator');
      const awb = result.awb_code || order.shipmentDetails?.awbCode;
      const courier = result.courier_name || order.shipmentDetails?.courierName || 'Shiprocket';

      if (result.already_dispatched) {
        showToast(`Order was already manifested with AWB ${awb || ''} (${courier})`, 'info');
      } else {
        showToast(`Shipment created successfully! AWB: ${awb || ''} via ${courier}`, 'success');
      }

      await storeService.refreshOrder(order.id);
      loadData();
    } catch (err: any) {
      const msg = err.message || 'Shiprocket dispatch failed.';
      setDispatchError(msg);
      showToast(msg, 'error');
    } finally {
      setDispatching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedAwb(true);
    setTimeout(() => setCopiedAwb(false), 2000);
    showToast('AWB copied to clipboard', 'info');
  };

  const handleRefreshTracking = async () => {
    if (!order || !order.shipmentDetails?.awbCode) return;
    setRefreshingTracking(true);
    try {
      const result = await storeService.refreshTracking(order.id, user?.name || 'Administrator');
      if (result.status_updated) {
        showToast(`Tracking refreshed! Status updated to ${result.shipping_status || result.current_status}`, 'success');
      } else {
        showToast(`Tracking up-to-date: ${result.current_status || 'In Transit'}`, 'info');
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to refresh tracking.', 'error');
    } finally {
      setRefreshingTracking(false);
    }
  };

  const handlePrintInvoice = () => {
    setShowPrintModal(true);
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
          {/* Shiprocket Dispatch Action in Header */}
          {!order.shipmentDetails?.awbCode && order.shippingStatus !== 'cancelled' && order.shippingStatus !== 'returned' && (
            <button
              type="button"
              onClick={handleShiprocketDispatch}
              disabled={dispatching || isPrepaidPending}
              className="px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-[#FF6B35] to-[#E85D26] hover:from-[#E85D26] hover:to-[#D44E19] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title={isPrepaidPending ? 'Prepaid payment must be captured before dispatch' : 'Create shipment with Shiprocket'}
            >
              {dispatching ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Truck size={13} />
                  <span>Create Shiprocket Shipment</span>
                </>
              )}
            </button>
          )}

          {order.shipmentDetails?.awbCode && (
            <a
              href={order.shipmentDetails.trackingUrl || `https://shiprocket.co/tracking/${order.shipmentDetails.awbCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
            >
              <Truck size={13} className="text-emerald-600" />
              <span>Track {order.shipmentDetails.courierName || 'Shipment'} ({order.shipmentDetails.awbCode})</span>
              <ExternalLink size={12} />
            </a>
          )}

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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-zinc-400 block text-[11px]">Payment Mode</span>
                <span className="font-bold text-zinc-900 uppercase font-mono">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Payment Provider</span>
                <span className="font-semibold text-zinc-800 uppercase font-mono">
                  {order.paymentDetails?.provider || (order.paymentDetails?.razorpayPaymentId ? 'Razorpay' : order.paymentDetails?.cfPaymentId ? 'Cashfree' : 'Direct')}
                </span>
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
                  {order.paymentDetails?.cfPaymentId || order.paymentDetails?.transactionId || order.paymentDetails?.razorpayPaymentId || order.id}
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

        {/* Right 1 Col: Customer Details, Logistics & Internal Notes */}
        <div className="space-y-6">
          {/* Shiprocket Logistics & Fulfillment Card */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-50 text-[#FF6B35]">
                  <Truck size={18} />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Shiprocket Logistics
                </h2>
              </div>
              <Badge
                variant={
                  order.shipmentDetails?.awbCode
                    ? 'success'
                    : isPrepaidPending
                    ? 'warning'
                    : 'info'
                }
              >
                {order.shipmentDetails?.awbCode
                  ? 'Manifested'
                  : isPrepaidPending
                  ? 'Payment Pending'
                  : 'Ready to Ship'}
              </Badge>
            </div>

            {/* Manifested State */}
            {order.shipmentDetails?.awbCode ? (
              <div className="space-y-3.5">
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Manifested & AWB Assigned
                    </span>
                    <button
                      type="button"
                      onClick={handleRefreshTracking}
                      disabled={refreshingTracking}
                      className="px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Fetch latest tracking status from Shiprocket"
                    >
                      <RefreshCw size={11} className={refreshingTracking ? 'animate-spin' : ''} />
                      <span>{refreshingTracking ? 'Tracking...' : 'Refresh Tracking'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-emerald-200/60">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-medium uppercase tracking-wider">
                        {order.shipmentDetails.courierName || 'Courier Partner'}
                      </span>
                      <span className="text-xs font-mono font-black text-zinc-900">{order.shipmentDetails.awbCode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(order.shipmentDetails?.awbCode || '')}
                      className="p-1.5 hover:bg-zinc-100 rounded-md text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                      title="Copy AWB Number"
                    >
                      {copiedAwb ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Live Status Pill & ETD */}
                  {(order.shipmentDetails.currentStatus || order.shipmentDetails.etd) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {order.shipmentDetails.currentStatus && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-900 text-[10px] font-bold uppercase tracking-wider">
                          Status: {order.shipmentDetails.currentStatus}
                        </span>
                      )}
                      {order.shipmentDetails.etd && (
                        <span className="text-[10px] text-emerald-800 font-medium">
                          Est. Delivery: {new Date(order.shipmentDetails.etd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Latest Scan Activity */}
                {order.shipmentDetails.trackingActivities && order.shipmentDetails.trackingActivities.length > 0 && (
                  <div className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                        <Clock size={12} className="text-[#FF6B35]" />
                        Latest Tracking Event
                      </span>
                      <span className="font-mono text-[10px]">
                        {new Date(order.shipmentDetails.trackingActivities[0].date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-900">{order.shipmentDetails.trackingActivities[0].activity}</p>
                    {order.shipmentDetails.trackingActivities[0].location && (
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <MapPin size={10} className="text-zinc-400" />
                        {order.shipmentDetails.trackingActivities[0].location}
                      </p>
                    )}
                  </div>
                )}

                {/* Expandable Scan History */}
                {order.shipmentDetails.trackingActivities && order.shipmentDetails.trackingActivities.length > 1 && (
                  <div className="border border-zinc-200/70 rounded-xl p-3 bg-white space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowAllScans(!showAllScans)}
                      className="w-full text-xs font-bold text-zinc-700 hover:text-zinc-900 flex items-center justify-between cursor-pointer"
                    >
                      <span>Tracking History ({order.shipmentDetails.trackingActivities.length} scans)</span>
                      {showAllScans ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showAllScans && (
                      <div className="space-y-3 pt-2 max-h-56 overflow-y-auto divide-y divide-zinc-100 text-xs">
                        {order.shipmentDetails.trackingActivities.map((act, idx) => (
                          <div key={idx} className="pt-2 first:pt-0">
                            <div className="flex items-center justify-between text-[10px] text-zinc-400">
                              <span className="font-semibold text-zinc-700">{act.activity}</span>
                              <span className="font-mono">{new Date(act.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                            {act.location && (
                              <p className="text-[10px] text-zinc-500 mt-0.5">{act.location}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Shipment ID</span>
                    <span className="font-mono font-semibold text-zinc-800 text-[11px]">
                      {order.shipmentDetails.shipmentId || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Shiprocket Order #</span>
                    <span className="font-mono font-semibold text-zinc-800 text-[11px]">
                      {order.shipmentDetails.shiprocketOrderId || order.orderNumber}
                    </span>
                  </div>
                </div>

                {order.shipmentDetails.dispatchedAt && (
                  <p className="text-[10px] text-zinc-400">
                    Dispatched on {new Date(order.shipmentDetails.dispatchedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    {order.shipmentDetails.dispatchedBy ? ` by ${order.shipmentDetails.dispatchedBy}` : ''}
                  </p>
                )}

                <div className="pt-2">
                  <a
                    href={order.shipmentDetails.trackingUrl || `https://shiprocket.co/tracking/${order.shipmentDetails.awbCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 text-xs font-bold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Track on Shiprocket</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ) : (
              /* Unmanifested State */
              <div className="space-y-3.5">
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Manifest this order with Shiprocket to assign the optimal courier partner, generate an AWB number, and sync live tracking with the customer ledger.
                </p>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1.5 text-xs text-zinc-600">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Parcel units</span>
                    <span className="font-semibold text-zinc-800">{order.items.reduce((s, i) => s + i.quantity, 0)} pcs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Estimated weight</span>
                    <span className="font-semibold text-zinc-800">~{Math.max(0.5, order.items.reduce((s, i) => s + i.quantity, 0) * 0.4).toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Destination PIN</span>
                    <span className="font-mono font-semibold text-zinc-800">{order.shippingAddress.pincode}</span>
                  </div>
                </div>

                {isPrepaidPending && (
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                    <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Payment Settlement Required</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Prepaid orders must have payment status marked as captured before Shiprocket manifestation.
                      </p>
                    </div>
                  </div>
                )}

                {dispatchError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                    <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Dispatch Failed</p>
                      <p className="text-[11px] text-rose-700 mt-0.5 break-words">{dispatchError}</p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleShiprocketDispatch}
                  disabled={dispatching || isPrepaidPending || order.shippingStatus === 'cancelled'}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-[#FF6B35] to-[#E85D26] hover:from-[#E85D26] hover:to-[#D44E19] rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {dispatching ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Creating Shiprocket Shipment...</span>
                    </>
                  ) : (
                    <>
                      <Truck size={14} />
                      <span>Create Shiprocket Shipment</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

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

      {/* Tax Invoice & Packaging Slip Preview Modal */}
      {showPrintModal && (
        <PrintableInvoice
          order={order}
          onClose={() => setShowPrintModal(false)}
          isModal={true}
        />
      )}

      {/* Direct Print Document (Triggered on native Ctrl+P or window.print) */}
      <div className="hidden print:block">
        <PrintableInvoice order={order} isModal={false} />
      </div>
    </div>
  );
}
