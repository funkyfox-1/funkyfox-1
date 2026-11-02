import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Grid,
  Search,
  ShoppingBag,
  User,
  Heart,
} from 'lucide-react';
import { isDemoLoggedIn, getDemoWishlist } from '../../data/accountMockData';

interface MobileBottomNavProps {
  cartCount: number;
  onOpenSearch: () => void;
}

export default function MobileBottomNav({ cartCount, onOpenSearch }: MobileBottomNavProps) {
  const location = useLocation();
  const loggedIn = isDemoLoggedIn();
  const wishlist = getDemoWishlist();

  // Hide on checkout, order confirmation, and PDP (where the sticky Add to Bag bar takes priority)
  const isPDP = location.pathname.startsWith('/products/') && location.pathname !== '/products';
  const isCheckout = location.pathname === '/checkout' || location.pathname === '/order-confirmation';

  if (isCheckout || isPDP) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      path: '/',
      isActive: location.pathname === '/' && !location.hash,
    },
    {
      label: 'Shop',
      icon: Grid,
      path: '/products',
      isActive: location.pathname === '/products',
    },
    {
      label: 'Search',
      icon: Search,
      isAction: true,
      onClick: onOpenSearch,
      isActive: false,
    },
    {
      label: 'Wishlist',
      icon: Heart,
      path: '/account/wishlist',
      badge: wishlist.length > 0 ? wishlist.length : undefined,
      isActive: location.pathname === '/account/wishlist',
    },
    {
      label: 'Bag',
      icon: ShoppingBag,
      path: '/cart',
      badge: cartCount > 0 ? cartCount : undefined,
      isActive: location.pathname === '/cart' || location.pathname === '/bag',
    },
    {
      label: 'Account',
      icon: User,
      path: loggedIn ? '/account' : '/login',
      isActive: location.pathname.startsWith('/account') && location.pathname !== '/account/wishlist',
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-[#E8E5DF] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const activeClass = item.isActive
            ? 'text-[#E87535] font-bold'
            : 'text-neutral-500 hover:text-ink font-medium';

          if (item.isAction) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] tracking-tight transition-colors active:scale-95"
              >
                <div className="relative p-1">
                  <Icon size={19} strokeWidth={item.isActive ? 2.2 : 1.75} />
                </div>
                <span className="mt-0.5">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path!}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] tracking-tight transition-colors active:scale-95 ${activeClass}`}
            >
              <div className="relative p-1">
                <Icon size={19} strokeWidth={item.isActive ? 2.2 : 1.75} />
                {item.badge !== undefined && (
                  <span className="absolute -top-0.5 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E87535] px-1 text-[9px] font-bold text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

