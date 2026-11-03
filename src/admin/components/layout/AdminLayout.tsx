import * as React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';
import { Skeleton } from '../ui/Skeleton';

export function AdminLayout() {
  const { user, loading } = useAdminAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // If loading session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-bold animate-pulse">
            FF
          </div>
          <p className="text-xs font-semibold text-zinc-500">Authorizing Admin Session...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, redirect to admin login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans text-zinc-900 selection:bg-[#FF6B35]/20 selection:text-[#FF6B35]">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <AdminHeader
          onOpenMobileSidebar={() => setMobileOpen(true)}
          collapsed={collapsed}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AdminBreadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
