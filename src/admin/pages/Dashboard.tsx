import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';

export function Dashboard() {
  const [refreshTick, setRefreshTick] = React.useState(0);
  const [syncing, setSyncing] = React.useState(false);

  React.useEffect(() => {
    const handleUpdate = () => setRefreshTick((t) => t + 1);
    window.addEventListener('funkyfox:store_updated', handleUpdate);
    return () => window.removeEventListener('funkyfox:store_updated', handleUpdate);
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await storeService.syncFromSupabase();
      setRefreshTick((t) => t + 1);
    } finally {
      setSyncing(false);
    }
  };

  const products = storeService.getProducts();
  const orders = storeService.getOrders();
  const categories = storeService.getCategories();
  const customers = storeService.getCustomers();

  // Metrics computation derived strictly from real database records
  const paidOrders = orders.filter((o) => o.paymentStatus === 'captured');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrdersCount = orders.length;
  const aov = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

  const pendingOrdersCount = orders.filter((o) => o.shippingStatus === 'pending').length;
  const processingOrdersCount = orders.filter((o) => o.shippingStatus === 'processing').length;
  const shippedOrdersCount = orders.filter((o) => o.shippingStatus === 'shipped').length;
  const deliveredOrdersCount = orders.filter((o) => o.shippingStatus === 'delivered').length;
  const cancelledOrdersCount = orders.filter((o) => o.shippingStatus === 'cancelled').length;

  const activeProductsCount = products.filter((p) => p.status === 'active').length;
  const draftProductsCount = products.filter((p) => p.status === 'draft').length;
  const lowStockItems = products.filter((p) => p.totalStock <= p.lowStockThreshold);
  const outOfStockItems = products.filter((p) => p.totalStock === 0);

  const recentOrders = orders.slice(0, 6);
  const topLowStock = lowStockItems.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Live Operations Control
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 font-display">
            Retail Operations Overview
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Real-time catalog metrics, customer transactions, and inventory fulfillment ledger.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            title="Refresh latest data from cloud database"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl hover:bg-[#e05624] transition-colors shadow-sm"
          >
            <Plus size={15} /> Add Product
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <ShoppingBag size={15} /> View Orders
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid (Derived from real database records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Verified Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          subtitle={`${paidOrders.length} completed transactions`}
          icon={<DollarSign size={20} className="text-emerald-600" />}
        />
        <StatCard
          title="Total Orders"
          value={totalOrdersCount}
          subtitle={`${pendingOrdersCount} pending fulfillment`}
          icon={<ShoppingBag size={20} className="text-blue-600" />}
        />
        <StatCard
          title="Average Order Value"
          value={`₹${aov.toLocaleString('en-IN')}`}
          subtitle="Revenue per paid order"
          icon={<TrendingUp size={20} className="text-purple-600" />}
        />
        <StatCard
          title="Active Catalogue"
          value={activeProductsCount}
          subtitle={`${products.length} total products (${draftProductsCount} drafts)`}
          icon={<Package size={20} className="text-[#FF6B35]" />}
        />
      </div>

      {/* Order Status Breakdown Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Fulfillment Pipeline Status
          </span>
          <Link to="/admin/orders" className="text-xs font-bold text-[#FF6B35] hover:underline">
            Manage Orders →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60">
            <span className="text-lg font-black text-amber-900 font-display block">{pendingOrdersCount}</span>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60">
            <span className="text-lg font-black text-blue-900 font-display block">{processingOrdersCount}</span>
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Processing</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/60">
            <span className="text-lg font-black text-sky-900 font-display block">{shippedOrdersCount}</span>
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">In Transit</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
            <span className="text-lg font-black text-emerald-900 font-display block">{deliveredOrdersCount}</span>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Delivered</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/60">
            <span className="text-lg font-black text-rose-900 font-display block">{cancelledOrdersCount}</span>
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                  Recent Orders
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Live transaction activity</p>
              </div>
              <Link
                to="/admin/orders"
                className="text-xs font-semibold text-[#FF6B35] hover:underline flex items-center gap-1"
              >
                View all orders <ArrowRight size={13} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-400">
                <Inbox size={36} className="mx-auto text-zinc-300 mb-3" />
                <p className="font-semibold text-zinc-700 text-sm">No customer orders recorded yet.</p>
                <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
                  When customer transactions occur on the storefront, their order details and line items will populate this operations ledger.
                </p>
                <a
                  href="/shop"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#FF6B35] hover:underline"
                >
                  Visit Live Storefront <ArrowRight size={12} />
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order Ref</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Fulfillment</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                          {order.orderNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-zinc-900">{order.customer.name}</p>
                          <p className="text-[11px] text-zinc-400">{order.customer.email}</p>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900">
                          ₹{Number(order.total).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
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
                        </td>
                        <td className="py-3.5 px-4">
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
                            {order.shippingStatus}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="px-2.5 py-1 text-[11px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors inline-block"
                          >
                            Details
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

        {/* Right 1 Col: Low Stock Attention Required */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Inventory Alerts
              </h2>
              <Link to="/admin/inventory" className="text-xs font-semibold text-[#FF6B35] hover:underline">
                All Inventory →
              </Link>
            </div>

            <div className="space-y-3">
              {topLowStock.length === 0 ? (
                <div className="p-8 bg-zinc-50 rounded-xl text-center text-xs text-zinc-400">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
                  <p className="font-bold text-zinc-800">Healthy Stock Reserves</p>
                  <p className="text-[11px] text-zinc-400 mt-1">All catalog items maintain stock above threshold.</p>
                </div>
              ) : (
                topLowStock.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/60 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="h-10 w-10 rounded-lg object-cover bg-zinc-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">{prod.name}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{prod.sku}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                          prod.totalStock === 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {prod.totalStock === 0 ? 'Out of Stock' : `${prod.totalStock} left`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-zinc-100">
            <Link
              to="/admin/inventory"
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors text-center block"
            >
              Audit Inventory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
