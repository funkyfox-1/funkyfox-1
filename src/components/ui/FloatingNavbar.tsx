import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X as CloseIcon,
  ArrowRight
} from 'lucide-react';
import { isDemoLoggedIn, getDemoUser } from '../../data/accountMockData';
import './FloatingNavbar.css';

interface FloatingNavbarProps {
  cartCount: number;
  onOpenSearch: () => void;
}

export default function FloatingNavbar({ cartCount, onOpenSearch }: FloatingNavbarProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const loggedIn = isDemoLoggedIn();
  const user = getDemoUser();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on navigation
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/products' },
    { label: 'About Us', path: '/about' },
    { label: 'Rewards', path: '/account' },
  ];

  return (
    <header className="fox-nav-wrapper">
      <div className={`fox-nav-bar ${isScrolled ? 'fox-nav-bar--scrolled' : ''}`}>
        <div className="fox-nav-container">
          {/* Left Group: Nav Links + Action Icons (Image 3 Reference Style) */}
          <div className="fox-nav-left-group">
            {/* Desktop Navigation Links */}
            <nav aria-label="Main Navigation" className="fox-nav-links">
              {navLinks.map((item) => {
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/' && !location.hash
                    : item.path === '/products'
                    ? location.pathname.startsWith('/products')
                    : item.path === '/about'
                    ? location.pathname.startsWith('/about')
                    : item.path === '/account'
                    ? location.pathname.startsWith('/account')
                    : false;

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`fox-nav-link ${isActive ? 'fox-nav-link--active' : ''}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Action Icons right next to nav links */}
            <div className="fox-nav-icons-row">
              {/* Account Profile Icon */}
              <Link
                to={loggedIn ? '/account' : '/login'}
                aria-label={loggedIn ? `Account for ${user?.name || 'User'}` : 'Customer Sign In'}
                title={loggedIn ? `Signed in as ${user?.name}` : 'Sign In'}
                className="fox-nav-icon-btn"
              >
                <User size={19} strokeWidth={1.75} />
                {loggedIn && <span className="fox-nav-user-active-dot" aria-hidden="true" />}
              </Link>

              {/* Search Icon */}
              <button
                type="button"
                aria-label="Search catalog"
                title="Search garments"
                onClick={onOpenSearch}
                className="fox-nav-icon-btn"
              >
                <Search size={19} strokeWidth={1.75} />
              </button>

              {/* Shopping Bag Icon with Badge */}
              <Link
                to="/cart"
                aria-label={`Shopping bag with ${cartCount} items`}
                title="Shopping Bag"
                className="fox-nav-icon-btn"
              >
                <ShoppingBag size={19} strokeWidth={1.75} />
                {cartCount > 0 && (
                  <span className="fox-nav-cart-badge" aria-label={`${cartCount} items in cart`}>
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Right Side: Editorial Brand Wordmark (Image 3 Style) */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="fox-nav-brand-right group"
              aria-label="Funky Fox Home"
            >
              <span className="fox-nav-wordmark">
                Funky<span className="fox-nav-wordmark-fox">Fox</span>
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="fox-nav-mobile-toggle"
            >
              {isMobileMenuOpen ? <CloseIcon size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fox-nav-drawer-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="fox-nav-drawer-card"
            role="dialog"
            aria-label="Mobile Navigation"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE1] mb-2">
                <span className="font-display text-lg font-black text-ink">Navigation</span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full text-neutral-500 hover:text-ink"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              <nav className="flex flex-col">
                <Link to="/" className="fox-nav-drawer-link">
                  <span>Home</span>
                  <ArrowRight size={14} className="text-neutral-400" />
                </Link>
                <Link to="/products" className="fox-nav-drawer-link">
                  <span>Shop</span>
                  <ArrowRight size={14} className="text-neutral-400" />
                </Link>
                <Link to="/about" className="fox-nav-drawer-link">
                  <span>About Us</span>
                  <ArrowRight size={14} className="text-neutral-400" />
                </Link>
                <Link to="/account/orders" className="fox-nav-drawer-link">
                  <span>My Orders</span>
                  <ArrowRight size={14} className="text-neutral-400" />
                </Link>
                <Link to="/account/wishlist" className="fox-nav-drawer-link">
                  <span>Saved Fits</span>
                  <ArrowRight size={14} className="text-neutral-400" />
                </Link>
                <Link to="/account" className="fox-nav-drawer-link">
                  <span>Customer Account & Rewards</span>
                  <ArrowRight size={14} className="text-neutral-400" />
                </Link>
                <Link to="/help" className="fox-nav-drawer-link">
                  <span>Customer Support</span>
                  <ArrowRight size={14} className="text-neutral-400" />
                </Link>
              </nav>
            </div>

            <div className="pt-4 border-t border-[#F0ECE1] space-y-2">
              <Link
                to={loggedIn ? '/account' : '/login'}
                className="w-full py-2.5 px-4 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider text-center block"
              >
                {loggedIn ? `Account (${user?.name.split(' ')[0]})` : 'Sign In to Account'}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full py-2 px-4 rounded-full border border-neutral-300 text-xs font-bold text-neutral-700 text-center block"
              >
                Search Garments
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
