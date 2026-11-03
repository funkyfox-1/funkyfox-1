import * as React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getDemoUser } from '../../data/accountMockData';
import './AccountStyles.css';

export default function AccountLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = React.useState(getDemoUser());

  // Listen to auth changes
  React.useEffect(() => {
    const handleAuthChange = () => {
      setUser(getDemoUser());
    };
    window.addEventListener('funky-fox-auth-change', handleAuthChange);
    return () => window.removeEventListener('funky-fox-auth-change', handleAuthChange);
  }, []);

  // Strict route protection: unauthenticated users redirect to login
  React.useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: {
          from: location.pathname,
          reason: 'Please sign in to access your Funky Fox profile and orders.'
        }
      });
    }
  }, [user, navigate, location.pathname]);

  if (!user) {
    return null;
  }

  const isProfileLanding = location.pathname === '/account' || location.pathname === '/account/';

  const subpageNav = [
    { label: 'Overview', path: '/account' },
    { label: 'My Orders', path: '/account/orders' },
    { label: 'Saved Fits', path: '/account/wishlist' },
    { label: 'Saved Addresses', path: '/account/addresses' },
    { label: 'Settings & Profile', path: '/account/profile' },
    { label: 'Reviews', path: '/account/reviews' }
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAF6ED] text-[#1c1d1a] flex flex-col justify-between relative overflow-x-hidden selection:bg-[#f16c24]/20 selection:text-[#1c1d1a]">
      {/* Top Minimal Branded Header */}
      <header className="w-full border-b border-[#EDE7D9]/70 bg-[#FAF6ED]/95 backdrop-blur-xs sticky top-0 z-40 transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* Logo near top-left */}
          <Link
            to="/"
            className="group inline-flex items-baseline gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f16c24] rounded-md px-1"
            aria-label="Funky Fox Home"
          >
            <span className="font-sans text-2xl sm:text-[26px] font-black tracking-tight text-[#1c1d1a]">
              Funky
            </span>
            <span className="font-sans text-2xl sm:text-[26px] font-black italic tracking-tight text-[#f16c24]">
              Fox
            </span>
          </Link>

          {/* Navigation links near top-right */}
          <div className="flex items-center gap-4 sm:gap-6">
            {!isProfileLanding && (
              <Link
                to="/account"
                className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#666259] hover:text-[#1c1d1a] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f16c24] rounded-md px-2 py-1"
              >
                <span className="transition-transform duration-200 group-hover:-translate-x-1" aria-hidden="true">&larr;</span>
                <span>My Profile</span>
              </Link>
            )}

            <Link
              to="/products"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1c1d1a] hover:text-[#f16c24] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f16c24] rounded-md px-2 py-1"
            >
              {isProfileLanding && (
                <span className="transition-transform duration-200 group-hover:-translate-x-1" aria-hidden="true">&larr;</span>
              )}
              <span>Back to Shop</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10">
        {isProfileLanding ? (
          <Outlet />
        ) : (
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1">
            {/* Subpage Sub-Navigation */}
            <nav className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#EDE7D9]">
              {subpageNav.map(item => {
                const isActive = item.path === '/account'
                  ? location.pathname === '/account' || location.pathname === '/account/'
                  : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[#1c1d1a] text-white shadow-xs'
                        : 'text-[#666259] hover:text-[#1c1d1a] hover:bg-[#F3EDE0]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <Outlet />
          </div>
        )}
      </main>

      {/* Bottom faint artistic lettering texture (matches reference image) */}
      {isProfileLanding && (
        <div
          className="w-full h-28 sm:h-36 md:h-44 pointer-events-none select-none opacity-80 bg-bottom bg-contain bg-no-repeat absolute bottom-0 left-0 right-0 z-0"
          style={{ backgroundImage: 'url(/images/profile-bottom-bg.png)' }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
