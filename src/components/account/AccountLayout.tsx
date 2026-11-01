import * as React from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Package,
  Heart,
  Star,
  MapPin,
  User,
  LogOut,
  RotateCcw,
  LayoutDashboard,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import {
  getDemoUser,
  logoutDemo,
  resetDemoData,
  getDemoOrders,
  getDemoWishlist
} from '../../data/accountMockData';
import Footer from '../Footer';
import './AccountStyles.css';

export default function AccountLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getDemoUser();

  const orders = getDemoOrders();
  const wishlist = getDemoWishlist();

  // Route protection
  React.useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, navigate, location.pathname]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logoutDemo();
    navigate('/login');
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo orders, addresses, and wishlist back to initial state?')) {
      resetDemoData();
      window.location.reload();
    }
  };

  const navItems = [
    { label: 'Overview', to: '/account', icon: LayoutDashboard, exact: true },
    {
      label: 'My Orders',
      to: '/account/orders',
      icon: Package,
      badge: orders.length.toString()
    },
    {
      label: 'Saved Fits',
      to: '/account/wishlist',
      icon: Heart,
      badge: wishlist.length.toString()
    },
    { label: 'My Reviews', to: '/account/reviews', icon: Star },
    { label: 'Addresses', to: '/account/addresses', icon: MapPin },
    { label: 'Profile Details', to: '/account/profile', icon: User }
  ];

  return (
    <div className="fox-account-page flex flex-col justify-between min-h-screen">
      <div className="fox-account-container w-full flex-1">
        {/* Breadcrumb & Top Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
            <Link to="/" className="hover:text-ink">Storefront</Link>
            <ChevronRight size={13} />
            <Link to="/account" className="text-ink">Customer Account</Link>
            {location.pathname !== '/account' && (
              <>
                <ChevronRight size={13} />
                <span className="text-[#E87535] capitalize">
                  {location.pathname.split('/')[2] || 'Details'}
                </span>
              </>
            )}
          </div>

          {/* Quick Demo Reset Button for Evaluator */}
          <button
            type="button"
            onClick={handleReset}
            title="Reset mock orders, addresses and wishlist to initial demo defaults"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 hover:text-[#E87535] transition-colors py-1 px-2.5 rounded-full bg-white border border-[#E8E5DF]"
          >
            <RotateCcw size={12} />
            Reset Demo Data
          </button>
        </div>

        {/* Mobile Horizontal Sticky Tabs Bar */}
        <div className="fox-mobile-account-tabs mb-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-ink text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-[#E8E5DF] hover:bg-[#FAF9F6]'
                }`
              }
            >
              <item.icon size={13} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-800">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* 2-Column Responsive Account Grid */}
        <div className="fox-account-grid">
          {/* Sidebar */}
          <aside className="fox-account-sidebar">
            <div className="fox-account-user-card">
              <img
                src={user.avatar}
                alt={user.name}
                className="fox-account-avatar"
                onError={(e) => {
                  e.currentTarget.src = '/images/hero-model.jpg';
                }}
              />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-base font-black uppercase tracking-tight text-ink truncate">
                  {user.name}
                </h2>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E87535]">
                    {user.tier}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="fox-account-nav" aria-label="Customer Account Navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `fox-account-nav-item ${isActive ? 'fox-account-nav-item--active' : ''}`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon size={17} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="fox-account-nav-badge">{item.badge}</span>
                  )}
                </NavLink>
              ))}

              <div className="my-2 border-t border-[#F0ECE1]" />

              <button
                type="button"
                onClick={handleLogout}
                className="fox-account-nav-item text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-left"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut size={17} />
                  <span>Sign Out</span>
                </div>
              </button>
            </nav>

            {/* Loyalty points card */}
            <div className="mt-6 p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E5DF] text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Fox Loyalty Balance
              </p>
              <p className="font-display text-xl font-black text-[#E87535] mt-0.5">
                {user.rewardsPoints} PTS
              </p>
              <p className="text-[11px] text-neutral-600 mt-1">
                ₹{Math.floor(user.rewardsPoints / 2)} credit on your next order
              </p>
            </div>
          </aside>

          {/* Main Account Area */}
          <main className="fox-account-main">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

