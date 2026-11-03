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
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { AdminOrder, OrderStatus } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import { exportToCsv } from '../lib/csvExport';
import { useAdminToast } from '../context/ToastContext';
import { EmptyState } from '../components/ui/EmptyState';

export function OrdersList() {
  const { showToast } = useAdminToast();
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [paymentFilter, setPaymentFilter] = React.useState<string>('all');
  const [dateFilter, setDateFilter] = React.useState<string>('all');

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

  const handleExportCsv = () => {
    const rows = filteredOrders.map((o) => ({
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
    showToast('Exported orders to CSV', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 font-display">
            Order Fulfillment
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Process incoming orders, review customer details, manage shipment progress, and track order lifecycles.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl hover:bg-zinc-50 transition-colors shadow-sm"
          >
            <Download size={14} /> Export Manifest
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
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

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
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
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total (INR)</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/60 transition-colors">
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
                      <span className="text-[11px] text-zinc-400 block truncate max-w-[160px]">
                        {order.items[0]?.name}
                        {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-zinc-900">
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
                            <span className="truncate max-w-[130px]">
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
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="px-3 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={13} /> Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
