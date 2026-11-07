import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  X,
  Award,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import {
  getDemoUser,
  getDemoOrders,
  getDemoWishlist,
  getDemoAddresses,
  logoutDemo,
  UserProfile
} from '../../data/accountMockData';

export default function AccountOverview() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<UserProfile | null>(getDemoUser());
  const [orders, setOrders] = React.useState(getDemoOrders());
  const [wishlist, setWishlist] = React.useState(getDemoWishlist());
  const [addresses, setAddresses] = React.useState(getDemoAddresses());

  // Modal for "My Account" details quick view
  const [isAccountModalOpen, setIsAccountModalOpen] = React.useState(false);

  // Sync state if localStorage changes or updates occur
  React.useEffect(() => {
    const syncData = () => {
      setUser(getDemoUser());
      setOrders(getDemoOrders());
      setWishlist(getDemoWishlist());
      setAddresses(getDemoAddresses());
    };
    window.addEventListener('storage', syncData);
    window.addEventListener('funky-fox-auth-change', syncData);
    window.addEventListener('funkyfox:store_updated', syncData);
    window.addEventListener('funky-fox-order-change', syncData);
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('funky-fox-auth-change', syncData);
      window.removeEventListener('funkyfox:store_updated', syncData);
      window.removeEventListener('funky-fox-order-change', syncData);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your Funky Fox account?')) {
      logoutDemo();
      navigate('/login');
    }
  };

  const navRows = [
    {
      id: 'account',
      label: 'My Account',
      sublabel: user ? `${user.name} · ${user.email}` : undefined,
      icon: User,
      action: () => setIsAccountModalOpen(true),
      badge: 'Profile'
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: Package,
      to: '/account/orders',
      badge: `${orders.length} order${orders.length === 1 ? '' : 's'}`
    },
    {
      id: 'wishlist',
      label: 'My Wishlist',
      icon: Heart,
      to: '/account/wishlist',
      badge: `${wishlist.length} item${wishlist.length === 1 ? '' : 's'}`
    },
    {
      id: 'addresses',
      label: 'Saved Addresses',
      icon: MapPin,
      to: '/account/addresses',
      badge: `${addresses.length} saved`
    },
    {
      id: 'settings',
      label: 'Settings & Profile',
      icon: Settings,
      to: '/account/profile'
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      action: handleLogout,
      isDanger: true
    }
  ];

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-12 flex-1 flex flex-col justify-center">
      {/* 2-Column Responsive Editorial Composition (Side-by-Side on Desktop) */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 z-10 w-full">
        
        {/* LEFT COLUMN: Editorial Typography & Floating Navigation Card */}
        <div className="w-full lg:w-1/2 max-w-xl flex flex-col justify-center">
          {/* Eyebrow Label with horizontal stroke */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-[.24em] text-[#1c1d1a]">
              MY PROFILE
            </span>
            <span className="h-[1.5px] w-12 sm:w-16 bg-[#1c1d1a]" aria-hidden="true" />
          </div>

          {/* Main Editorial Heading */}
          <h1 className="mt-4 sm:mt-6 font-sans text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-black tracking-tight leading-[1.08] text-[#1c1d1a]">
            Your Style.<br />
            Your <span className="text-[#f16c24]">Profile.</span>
          </h1>

          {/* Supporting Description */}
          <p className="mt-3.5 sm:mt-5 text-sm sm:text-base lg:text-[17px] text-[#55524c] max-w-lg leading-relaxed font-normal">
            Manage your account, track your orders and keep your Funky Fox journey smooth.
          </p>

          {/* Floating Navigation Card inspired by Reference Image */}
          <div className="mt-7 sm:mt-9 w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-[0_12px_36px_-10px_rgba(28,29,26,0.08)] border border-[#EAE5D9] p-2 sm:p-2.5 divide-y divide-[#F5F2EB]/80">
            {navRows.map((row) => {
              const Icon = row.icon;
              const content = (
                <div className="w-full flex items-center justify-between py-3 sm:py-3.5 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl transition-all duration-150 hover:bg-[#FAF7F0] group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f16c24]">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      row.isDanger
                        ? 'bg-red-50 text-red-600 group-hover:bg-red-100'
                        : 'bg-[#F4F0E6] text-[#1c1d1a] group-hover:bg-[#EDE7D9] group-hover:text-[#f16c24]'
                    }`}>
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    <div className="text-left truncate">
                      <p className={`text-sm sm:text-[15px] font-bold tracking-tight truncate ${
                        row.isDanger ? 'text-red-600' : 'text-[#1c1d1a] group-hover:text-[#f16c24]'
                      }`}>
                        {row.label}
                      </p>
                      {row.sublabel && (
                        <p className="text-[11px] text-[#78756e] truncate font-medium">
                          {row.sublabel}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {row.badge && (
                      <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5EB] text-[#855e38] border border-[#EFE8DA]">
                        {row.badge}
                      </span>
                    )}
                    <ChevronRight
                      size={17}
                      className="text-[#A5A29A] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#1c1d1a]"
                    />
                  </div>
                </div>
              );

              if (row.to) {
                return (
                  <Link key={row.id} to={row.to} className="block w-full">
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={row.action}
                  className="block w-full text-left"
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Funky Fox Mascot Artwork */}
        <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end relative pt-4 lg:pt-0">
          {/* Seamless SVG-blended mascot illustration */}
          <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[460px] lg:max-w-[500px] xl:max-w-[540px] flex items-center justify-center">
            <img
              src="/images/profile-mascot.png"
              alt="Funky Fox Mascot"
              className="w-full h-auto max-h-[55vh] lg:max-h-[560px] object-contain select-none pointer-events-none transition-opacity duration-300 drop-shadow-xs"
              width={515}
              height={705}
              loading="eager"
            />
          </div>
        </div>

      </div>

      {/* MODAL: Customer Profile Quick View ("My Account") */}
      {isAccountModalOpen && user && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="relative w-full max-w-lg bg-[#FAF8F2] rounded-3xl border border-[#E8E2D5] shadow-2xl p-6 sm:p-8 overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsAccountModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-[#706d66] hover:text-[#1c1d1a] hover:bg-[#EFE9DC] transition-colors"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            {/* Modal Header with Avatar */}
            <div className="flex items-center gap-4 border-b border-[#EDE7D9] pb-5">
              <div className="relative">
                <img
                  src={user.avatar || '/images/standard/model-tall-clean.jpg'}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#f16c24] shadow-xs"
                />
                <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#f16c24] text-white">
                  <Award size={12} />
                </span>
              </div>
              <div className="min-w-0">
                <h2 id="modal-title" className="text-xl sm:text-2xl font-black text-[#1c1d1a] tracking-tight truncate">
                  {user.name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={11} className="text-emerald-600" />
                    Verified Customer
                  </span>
                </div>
              </div>
            </div>

            {/* Account Details Grid */}
            <div className="py-5 space-y-3.5 text-sm text-[#383633]">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#855e38] shrink-0" />
                <span className="font-semibold text-neutral-500 w-24 shrink-0">Email:</span>
                <span className="font-medium text-[#1c1d1a] truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#855e38] shrink-0" />
                <span className="font-semibold text-neutral-500 w-24 shrink-0">Phone:</span>
                <span className="font-medium text-[#1c1d1a]">{user.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[#855e38] shrink-0" />
                <span className="font-semibold text-neutral-500 w-24 shrink-0">Member Since:</span>
                <span className="font-medium text-[#1c1d1a]">{user.memberSince}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-[#855e38] shrink-0" />
                <span className="font-semibold text-neutral-500 w-24 shrink-0">Fit Size:</span>
                <span className="font-bold text-[#f16c24] bg-white px-2 py-0.5 rounded border border-[#EDE7D9]">
                  {user.preferredSize}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-[#EDE7D9] flex flex-col sm:flex-row gap-3">
              <Link
                to="/account/profile"
                onClick={() => setIsAccountModalOpen(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1c1d19] hover:bg-[#2f302b] text-white text-xs sm:text-sm font-bold tracking-wide transition-colors"
              >
                <span>Edit Profile Details</span>
                <ExternalLink size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="py-3 px-5 rounded-xl bg-white hover:bg-[#F3EEE3] text-[#1c1d1a] text-xs sm:text-sm font-bold border border-[#E0D8C8] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
