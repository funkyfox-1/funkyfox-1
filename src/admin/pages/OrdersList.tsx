import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  AlertCircle,
  Printer,
  CheckSquare,
  Square,
  MinusSquare,
  Zap,
  ArrowRight,
  Package,
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { AdminOrder, OrderStatus } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import { exportToCsv } from '../lib/csvExport';
import { useAdminToast } from '../context/ToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { EmptyState } from '../components/ui/EmptyState';
import { PrintableInvoice } from '../components/orders/PrintableInvoice';

export function OrdersList() {
  const { user } = useAdminAuth();
  const { showToast } = useAdminToast();
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [paymentFilter, setPaymentFilter] = React.useState<string>('all');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [printingOrder, setPrintingOrder] = React.useState<AdminOrder | null>(null);

  const loadData = () => {
    setOrders(storeService.getOrders());
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('funkyfox:store_updated', loadData);
    return () => window.removeEventListener('funkyfox:store_updated', loadData);
  }, []);

  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.phone.includes(search);

      const matchStatus = statusFilter === 'all' || o.shippingStatus === statusFilter;
      const matchPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  // Status Metrics for Quick Filter Strip
  const metrics = React.useMemo(() => {
    const total = orders.length;
    const actionNeeded = orders.filter((o) => ['pending', 'confirmed'].includes(o.shippingStatus)).length;
    const inWarehouse = orders.filter((o) => ['processing', 'packed'].includes(o.shippingStatus)).length;
    const inTransit = orders.filter((o) => ['shipped', 'out_for_delivery'].includes(o.shippingStatus)).length;
    const delivered = orders.filter((o) => o.shippingStatus === 'delivered').length;
    return { total, actionNeeded, inWarehouse, inTransit, delivered };
  }, [orders]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Batch Status Transition
  const handleBatchStatusUpdate = (newStatus: OrderStatus) => {
    if (selectedIds.length === 0) return;
    const adminName = user?.name || 'Administrator';
    let updatedCount = 0;

    selectedIds.forEach((orderId) => {
      const updated = storeService.updateOrderStatus(
        orderId,
        newStatus,
        adminName,
        `Batch update to ${newStatus}`
      );
      if (updated) updatedCount++;
    });

    showToast(`Updated ${updatedCount} orders to "${newStatus.replace('_', ' ')}"`, 'success');
    setSelectedIds([]);
    loadData();
  };

  const handleExportCsv = (targetOrders: AdminOrder[] = filteredOrders) => {
    const rows = targetOrders.map((o) => ({
      OrderNumber: o.orderNumber,
      Date: o.createdAt,
      CustomerName: o.customer.name,
      CustomerEmail: o.customer.email,
      CustomerPhone: o.customer.phone,
      ItemCount: o.items.length,
      Subtotal: o.subtotal,
      Discount: o.discount,
      CouponCode: o.couponCode || '',
      Shipping: o.shippingCharge,
      Tax: o.tax,
      Total: o.total,
      PaymentMethod: o.paymentMethod,
      PaymentStatus: o.paymentStatus,
      FulfillmentStatus: o.fulfillmentStatus,
      ShippingStatus: o.shippingStatus,
      Courier: o.shipmentDetails?.courierName || '',
      AWB: o.shipmentDetails?.awbCode || '',
    }));
    exportToCsv('funkyfox_orders_manifest', rows);
    showToast(`Exported ${targetOrders.length} orders to CSV manifest`, 'info');
  };

  const selectedOrders = React.useMemo(() => {
    return orders.filter((o) => selectedIds.includes(o.id));
  }, [orders, selectedIds]);

  const allSelected = filteredOrders.length > 0 && selectedIds.length === filteredOrders.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredOrders.length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 font-display">
            Order Fulfillment
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Process customer orders, print packaging slips &amp; tax invoices, track courier dispatches, and trigger status updates.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleExportCsv(filteredOrders)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl hover:bg-zinc-50 transition-colors shadow-xs cursor-pointer"
          >
            <Download size={14} /> Export Manifest
          </button>
        </div>
      </div>

      {/* Operational Metrics Pill Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
              : 'bg-white border-zinc-200/80 text-zinc-700 hover:border-zinc-300'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">All Orders</div>
          <div className="text-lg font-black mt-0.5 tabular-nums">{metrics.total}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white border-zinc-200/80 text-zinc-700 hover:border-zinc-300'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending Review</div>
          <div className="text-lg font-black mt-0.5 tabular-nums text-amber-900">{metrics.actionNeeded}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('processing')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'processing'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white border-zinc-200/80 text-zinc-700 hover:border-zinc-300'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">In Warehouse</div>
          <div className="text-lg font-black mt-0.5 tabular-nums text-blue-900">{metrics.inWarehouse}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('shipped')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'shipped'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white border-zinc-200/80 text-zinc-700 hover:border-zinc-300'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">In Transit</div>
          <div className="text-lg font-black mt-0.5 tabular-nums text-indigo-900">{metrics.inTransit}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('delivered')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            statusFilter === 'delivered'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white border-zinc-200/80 text-zinc-700 hover:border-zinc-300'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Delivered</div>
          <div className="text-lg font-black mt-0.5 tabular-nums text-emerald-900">{metrics.delivered}</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, customer name, email, or phone..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-zinc-700 focus:outline-none w-full md:w-auto"
        >
          <option value="all">All Shipping Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-zinc-700 focus:outline-none w-full md:w-auto"
        >
          <option value="all">All Payment Statuses</option>
          <option value="captured">Captured (Paid)</option>
          <option value="pending">Pending (COD/Gateway)</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={28} />}
            title="No orders found"
            description="No customer orders match the applied filters."
            actionLabel="Reset Search"
            onAction={() => {
              setSearch('');
              setStatusFilter('all');
              setPaymentFilter('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-zinc-400 hover:text-zinc-700 transition-colors"
                      aria-label="Select all orders"
                    >
                      {allSelected ? (
                        <CheckSquare size={16} className="text-[#FF6B35]" />
                      ) : isIndeterminate ? (
                        <MinusSquare size={16} className="text-[#FF6B35]" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total (INR)</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredOrders.map((order) => {
                  const isSelected = selectedIds.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-zinc-50/70 transition-colors ${
                        isSelected ? 'bg-orange-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRow(order.id)}
                          className="text-zinc-400 hover:text-zinc-700 transition-colors"
                          aria-label={`Select order ${order.orderNumber}`}
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-[#FF6B35]" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                        <Link to={`/admin/orders/${order.id}`} className="hover:text-[#FF6B35]">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-zinc-900">{order.customer.name}</p>
                        <p className="text-[11px] text-zinc-400">{order.customer.phone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-zinc-700">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} pcs
                        </span>
                        <span className="text-[11px] text-zinc-400 block truncate max-w-[150px]">
                          {order.items[0]?.name}
                          {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-zinc-900 tabular-nums">
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
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
                          <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <Badge
                            variant={
                              order.shippingStatus === 'delivered'
                                ? 'success'
                                : order.shippingStatus === 'shipped' || order.shippingStatus === 'out_for_delivery'
                                ? 'info'
                                : order.shippingStatus === 'cancelled'
                                ? 'error'
                                : 'warning'
                            }
                          >
                            {order.shippingStatus.replace(/_/g, ' ')}
                          </Badge>
                          {order.shipmentDetails?.awbCode ? (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-mono font-medium">
                              <Truck size={11} className="text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[120px]">
                                {order.shipmentDetails.courierName || 'Shiprocket'}: {order.shipmentDetails.awbCode}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-400">
                              {order.paymentMethod === 'cod' || order.paymentStatus === 'captured' ? 'Ready to manifest' : 'Unmanifested'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPrintingOrder(order)}
                            className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                            title="Print Tax Invoice / Packaging Slip"
                            aria-label={`Print invoice for ${order.orderNumber}`}
                          >
                            <Printer size={15} />
                          </button>
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="px-2.5 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <Eye size={13} /> Manage
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Batch Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-zinc-800 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 pr-2 border-r border-zinc-700">
            <span className="h-2 w-2 rounded-full bg-[#FF6B35] animate-pulse" />
            <span className="text-xs font-bold text-white whitespace-nowrap">
              {selectedIds.length} orders selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleBatchStatusUpdate('processing')}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Mark Processing
            </button>
            <button
              type="button"
              onClick={() => handleBatchStatusUpdate('shipped')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Mark Shipped
            </button>
            <button
              type="button"
              onClick={() => handleBatchStatusUpdate('delivered')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Mark Delivered
            </button>
            <button
              type="button"
              onClick={() => handleExportCsv(selectedOrders)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Download size={13} /> Export CSV
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1.5 ml-1 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal Preview */}
      {printingOrder && (
        <PrintableInvoice
          order={printingOrder}
          onClose={() => setPrintingOrder(null)}
          isModal={true}
        />
      )}
    </div>
  );
}
