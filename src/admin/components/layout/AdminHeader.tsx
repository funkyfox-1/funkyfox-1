import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Plus,
  LogOut,
  User,
  Settings as SettingsIcon,
  AlertTriangle,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { storeService } from '../../services/storeService';
import { Badge } from '../ui/Badge';

interface AdminHeaderProps {
  onOpenMobileSidebar: () => void;
  collapsed: boolean;
}

export function AdminHeader({ onOpenMobileSidebar, collapsed }: AdminHeaderProps) {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const notifContainerRef = React.useRef<HTMLDivElement>(null);
  const profileContainerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('admin-global-search') as HTMLInputElement;
        input?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const allProducts = storeService.getProducts();
  const allOrders = storeService.getOrders();

  // Search matches
  const filteredProducts = searchQuery.trim()
    ? allProducts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const filteredOrders = searchQuery.trim()
    ? allOrders
        .filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
    : [];

  // Low stock notifications
  const lowStockProducts = allProducts.filter((p) => p.totalStock <= p.lowStockThreshold);
  const pendingOrders = allOrders.filter((o) => o.shippingStatus === 'pending');
  const notificationCount = lowStockProducts.length + pendingOrders.length;

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-white border-b border-zinc-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          aria-label="Open navigation drawer"
        >
          <Menu size={20} />
        </button>

        {/* Search Bar with Autocomplete */}
        <div ref={searchContainerRef} className="relative w-full max-w-md">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              id="admin-global-search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search products, orders, SKUs... (Ctrl+K)"
              className="w-full pl-9 pr-12 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all text-zinc-900 placeholder:text-zinc-400"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 bg-zinc-100 rounded border border-zinc-200 hidden sm:inline-block">
              ⌘K
            </span>
          </div>

          {/* Search Dropdown */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
              {filteredProducts.length === 0 && filteredOrders.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-400">No matches found for "{searchQuery}"</div>
              ) : (
                <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
                  {filteredProducts.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Products ({filteredProducts.length})
                      </div>
                      {filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            navigate(`/admin/products/${p.id}`);
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 text-left transition-colors"
                        >
                          <img src={p.image} alt={p.name} className="h-9 w-9 rounded-md object-cover border border-zinc-100 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-zinc-900 truncate">{p.name}</p>
                            <p className="text-[11px] text-zinc-400">SKU: {p.sku} · ₹{p.price}</p>
                          </div>
                          <Badge variant={p.status === 'active' ? 'success' : 'neutral'} size="sm">
                            {p.status}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredOrders.length > 0 && (
                    <div className="border-t border-zinc-100 pt-2">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Orders ({filteredOrders.length})
                      </div>
                      {filteredOrders.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => {
                            navigate(`/admin/orders/${o.id}`);
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 text-left transition-colors"
                        >
                          <div>
                            <p className="text-xs font-semibold text-zinc-900">{o.orderNumber}</p>
                            <p className="text-[11px] text-zinc-400">{o.customer.name} · ₹{o.total}</p>
                          </div>
                          <Badge variant={o.shippingStatus === 'delivered' ? 'success' : 'warning'} size="sm">
                            {o.shippingStatus}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Add Product */}
        <Link
          to="/admin/products/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF6B35] text-white text-xs font-semibold rounded-xl hover:bg-[#e05624] transition-colors shadow-sm"
        >
          <Plus size={15} />
          <span>Add Product</span>
        </Link>

        {/* Notifications Popover */}
        <div ref={notifContainerRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-[#FF6B35] text-white text-[10px] font-bold flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">Notifications</span>
                <span className="text-[11px] font-semibold text-zinc-400">{notificationCount} pending</span>
              </div>
              <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
                {lowStockProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/admin/inventory`}
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-amber-50/60 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                      <AlertTriangle size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-900 truncate">Low stock: {p.name}</p>
                      <p className="text-[11px] text-amber-700">Only {p.totalStock} units remaining</p>
                    </div>
                  </Link>
                ))}

                {pendingOrders.map((o) => (
                  <Link
                    key={o.id}
                    to={`/admin/orders/${o.id}`}
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                      <ShoppingBag size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-900">New Order {o.orderNumber}</p>
                      <p className="text-[11px] text-zinc-500">₹{o.total} from {o.customer.name}</p>
                    </div>
                  </Link>
                ))}

                {notificationCount === 0 && (
                  <div className="p-6 text-center text-xs text-zinc-400">All systems operational — No pending alerts</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div ref={profileContainerRef} className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-100 transition-colors"
            aria-label="User menu"
          >
            <div className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                user?.name?.slice(0, 2).toUpperCase() || 'AD'
              )}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-4 py-3 border-b border-zinc-100">
                <p className="text-xs font-bold text-zinc-900 truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-zinc-400 truncate">{user?.email || 'admin@funkyfox.in'}</p>
                <div className="mt-1.5">
                  <Badge variant="orange" size="sm">
                    {user?.role?.replace('_', ' ') || 'Admin'}
                  </Badge>
                </div>
              </div>

              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/admin/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors"
                >
                  <SettingsIcon size={15} className="text-zinc-400" />
                  <span>Store Settings</span>
                </Link>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors"
                >
                  <ExternalLink size={15} className="text-zinc-400" />
                  <span>View Storefront</span>
                </a>
              </div>

              <div className="p-1.5 border-t border-zinc-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
