import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Heart,
  MapPin,
  User,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  getDemoUser,
  getDemoOrders,
  getDemoWishlist,
  getDemoAddresses
} from '../../data/accountMockData';
import { formatPrice } from '../../data/products';
import './AccountStyles.css';

export default function AccountOverview() {
  const user = getDemoUser();
  const orders = getDemoOrders();
  const wishlist = getDemoWishlist();
  const addresses = getDemoAddresses();

  const latestOrder = orders[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <span className="fox-status-badge fox-status-badge--processing"><Clock size={11} /> Processing</span>;
      case 'shipped':
        return <span className="fox-status-badge fox-status-badge--shipped"><Truck size={11} /> In Transit</span>;
      case 'delivered':
        return <span className="fox-status-badge fox-status-badge--delivered"><CheckCircle2 size={11} /> Delivered</span>;
      default:
        return <span className="fox-status-badge">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Friendly Greeting Header */}
      <div className="border-b border-[#F0ECE1] pb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E87535]">
          <Sparkles size={14} />
          <span>Member Dashboard</span>
        </div>
        <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-ink">
          Welcome back, {user?.name.split(' ')[0] || 'Member'}.
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Track active shipments, manage your saved wardrobe, and review recent orders.
        </p>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/account/orders"
          className="group p-4 rounded-xl border border-[#E8E5DF] bg-[#FAF9F6] hover:border-ink hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-neutral-400 group-hover:text-ink">
            <Package size={20} />
            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="mt-3 font-display text-2xl font-black text-ink">{orders.length}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mt-0.5">Total Orders</p>
        </Link>

        <Link
          to="/account/wishlist"
          className="group p-4 rounded-xl border border-[#E8E5DF] bg-[#FAF9F6] hover:border-ink hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-neutral-400 group-hover:text-[#E87535]">
            <Heart size={20} />
            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="mt-3 font-display text-2xl font-black text-ink">{wishlist.length}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mt-0.5">Saved Fits</p>
        </Link>

        <Link
          to="/account/addresses"
          className="group p-4 rounded-xl border border-[#E8E5DF] bg-[#FAF9F6] hover:border-ink hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-neutral-400 group-hover:text-ink">
            <MapPin size={20} />
            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="mt-3 font-display text-2xl font-black text-ink">{addresses.length}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mt-0.5">Saved Addresses</p>
        </Link>
      </div>

      {/* Latest Active Order Spotlight */}
      {latestOrder && (
        <div className="rounded-xl border border-[#E8E5DF] bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0ECE1] pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Latest Order Activity
              </p>
              <h3 className="font-display text-lg font-black uppercase text-ink mt-0.5">
                {latestOrder.orderNumber}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(latestOrder.status)}
              <Link
                to={`/account/orders/${latestOrder.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink hover:text-[#E87535] transition-colors"
              >
                Track & Details <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Items row */}
            <div className="flex items-center gap-3">
              {latestOrder.items.slice(0, 3).map((item) => (
                <img
                  key={item.id}
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-20 object-cover rounded-lg border border-[#E8E5DF] bg-[#FAF9F6]"
                  onError={(e) => {
                    e.currentTarget.src = '/images/product-tshirt.webp';
                  }}
                />
              ))}
              <div className="ml-1">
                <p className="text-sm font-bold text-ink leading-snug">
                  {latestOrder.items[0]?.name}
                  {latestOrder.items.length > 1 && ` +${latestOrder.items.length - 1} more`}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Ordered on {latestOrder.date}
                </p>
                <p className="text-xs font-bold text-ink mt-1">
                  Total: {formatPrice(latestOrder.total)}
                </p>
              </div>
            </div>

            {/* Estimated delivery pill */}
            <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E8E5DF] text-left sm:text-right w-full sm:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Estimated Delivery
              </span>
              <span className="font-display text-sm font-black text-ink block mt-0.5">
                {latestOrder.estimatedDelivery}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Account Shortcuts */}
      <div className="pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
          Account Shortcuts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/account/orders"
            className="flex items-center justify-between p-3.5 rounded-lg border border-[#E8E5DF] hover:border-ink transition-colors"
          >
            <div>
              <p className="text-sm font-bold text-ink">Order History & Returns</p>
              <p className="text-xs text-neutral-500">View invoices, track couriers, or request exchanges.</p>
            </div>
            <ArrowRight size={15} className="text-neutral-400" />
          </Link>

          <Link
            to="/account/profile"
            className="flex items-center justify-between p-3.5 rounded-lg border border-[#E8E5DF] hover:border-ink transition-colors"
          >
            <div>
              <p className="text-sm font-bold text-ink">Personal & Fit Settings</p>
              <p className="text-xs text-neutral-500">Update sizing preferences, contact info, and security.</p>
            </div>
            <ArrowRight size={15} className="text-neutral-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}

