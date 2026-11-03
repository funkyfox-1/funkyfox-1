import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ArrowRight,
  Filter,
  Sparkles
} from 'lucide-react';
import { getDemoOrders, Order } from '../../data/accountMockData';
import { formatPrice } from '../../data/products';
import './AccountStyles.css';

export default function AccountOrders() {
  const [filter, setFilter] = React.useState<string>('all');
  const allOrders = getDemoOrders();

  const filteredOrders = React.useMemo(() => {
    if (filter === 'all') return allOrders;
    if (filter === 'returns') return allOrders.filter(o => o.status === 'returned');
    return allOrders.filter(o => o.status === filter);
  }, [allOrders, filter]);

  const tabs = [
    { id: 'all', label: 'All Orders', count: allOrders.length },
    { id: 'processing', label: 'Processing', count: allOrders.filter(o => o.status === 'processing').length },
    { id: 'shipped', label: 'Shipped', count: allOrders.filter(o => o.status === 'shipped').length },
    { id: 'delivered', label: 'Delivered', count: allOrders.filter(o => o.status === 'delivered').length },
    { id: 'cancelled', label: 'Cancelled', count: allOrders.filter(o => o.status === 'cancelled').length },
    { id: 'returns', label: 'Returns', count: allOrders.filter(o => o.status === 'returned').length },
  ];

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return <span className="fox-status-badge fox-status-badge--processing"><Clock size={11} /> Processing</span>;
      case 'shipped':
        return <span className="fox-status-badge fox-status-badge--shipped"><Truck size={11} /> In Transit</span>;
      case 'delivered':
        return <span className="fox-status-badge fox-status-badge--delivered"><CheckCircle2 size={11} /> Delivered</span>;
      case 'cancelled':
        return <span className="fox-status-badge fox-status-badge--cancelled"><XCircle size={11} /> Cancelled</span>;
      case 'returned':
        return <span className="fox-status-badge fox-status-badge--returned"><RotateCcw size={11} /> Returned</span>;
      default:
        return <span className="fox-status-badge">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0ECE1] pb-5">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-ink">
            My Orders
          </h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            View order details, delivery tracking, invoices, and cancellation/return status.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === tab.id
                ? 'bg-ink text-white shadow-xs'
                : 'bg-[#FAF9F6] text-neutral-600 hover:bg-[#F0ECE1] border border-[#E8E5DF]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              filter === tab.id ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#E8E5DF] rounded-2xl bg-[#FAF9F6] p-8">
          <Package size={36} className="mx-auto text-neutral-400 mb-3" />
          <h3 className="font-display text-base font-bold uppercase text-ink">No orders found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            You do not have any orders matching the selected status filter.
          </p>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className="mt-4 px-4 py-2 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800"
          >
            View All Orders
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-[#E8E5DF] bg-white p-5 hover:border-neutral-400 transition-all shadow-xs"
            >
              {/* Order Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0ECE1] pb-3.5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Order</span>
                  <p className="font-display text-base font-black text-ink">{order.orderNumber}</p>
                  <span className="text-[11px] text-neutral-500">Placed on {order.date}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  {getStatusBadge(order.status)}
                  {order.status === 'delivered' && (
                    <Link
                      to={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-full bg-[#E87535]/10 border border-[#E87535]/30 text-[#E87535] hover:bg-[#E87535] hover:text-white transition-colors shadow-2xs"
                    >
                      <Sparkles size={12} />
                      <span>Rate Fit (+50 pts)</span>
                    </Link>
                  )}
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-full bg-[#FAF9F6] border border-[#E8E5DF] text-ink hover:bg-ink hover:text-white transition-colors"
                  >
                    View Details <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Items row */}
              <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2.5">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-18 object-cover rounded-md border border-[#E8E5DF] bg-[#FAF9F6]"
                        onError={(e) => {
                          e.currentTarget.src = '/images/product-tshirt.webp';
                        }}
                      />
                      <div>
                        <p className="text-xs font-bold text-ink max-w-[180px] truncate">{item.name}</p>
                        <p className="text-[11px] text-neutral-500">
                          {item.color} · Size {item.size} · Qty {item.quantity}
                        </p>
                        <p className="text-xs font-bold text-ink mt-0.5">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-6 self-end md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#F0ECE1] w-full md:w-auto justify-between md:justify-end">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Total</span>
                    <span className="font-display text-base font-black text-ink">{formatPrice(order.total)}</span>
                  </div>

                  <Link
                    to={`/account/orders/${order.id}`}
                    className="md:hidden text-xs font-bold uppercase tracking-wider text-[#E87535]"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

