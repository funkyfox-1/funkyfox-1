import * as React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  Tag,
  Image as ImageIcon,
  LayoutTemplate,
  BarChart3,
  Settings,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const { user, hasRole } = useAdminAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Products', path: '/admin/products', icon: Package, roles: ['super_admin', 'admin'] },
    { label: 'Categories', path: '/admin/categories', icon: Layers, roles: ['super_admin', 'admin'] },
    { label: 'Inventory', path: '/admin/inventory', icon: Boxes, roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag, roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Customers', path: '/admin/customers', icon: Users, roles: ['super_admin', 'admin'] },
    { label: 'Coupons', path: '/admin/coupons', icon: Tag, roles: ['super_admin', 'admin'] },
    { label: 'Media Library', path: '/admin/media', icon: ImageIcon, roles: ['super_admin', 'admin'] },
    { label: 'Website Content', path: '/admin/website-content', icon: LayoutTemplate, roles: ['super_admin', 'admin'] },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, roles: ['super_admin', 'admin'] },
    { label: 'Settings', path: '/admin/settings', icon: Settings, roles: ['super_admin'] },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-zinc-200/80 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100">
          <Link to="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-[#171717] flex items-center justify-center shrink-0 shadow-sm">
              <span className="font-display font-black text-white text-base">FF</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-display font-black tracking-tight text-sm text-zinc-900 leading-tight">
                  FUNKY <span className="text-[#FF6B35]">FOX</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Admin Portal
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            if (!hasRole(item.roles as any)) return null;
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-orange-50 text-[#FF6B35]'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-[#FF6B35]' : 'text-zinc-400 group-hover:text-zinc-700'
                  }`}
                />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Live Storefront Link */}
        <div className="p-3 border-t border-zinc-100">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            title={collapsed ? 'Open customer storefront' : undefined}
          >
            <ExternalLink size={16} className="shrink-0 text-zinc-400" />
            {!collapsed && <span>Live Storefront</span>}
          </a>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-zinc-200 border border-zinc-300 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-zinc-700">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user?.name?.slice(0, 2).toUpperCase() || 'AD'
              )}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-900 truncate">{user?.name || 'Administrator'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] text-zinc-500 capitalize">{user?.role?.replace('_', ' ') || 'Admin'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
