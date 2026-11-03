import * as React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ToastProvider } from './context/ToastContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { initSupabaseRealtime } from './services/supabaseRealtime';

// Lazy Loaded Admin Pages for Optimized Performance and Code Splitting
const AdminLogin = React.lazy(() => import('./pages/AdminLogin').then((m) => ({ default: m.AdminLogin })));
const AdminForgotPassword = React.lazy(() => import('./pages/AdminForgotPassword').then((m) => ({ default: m.AdminForgotPassword })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const ProductsList = React.lazy(() => import('./pages/ProductsList').then((m) => ({ default: m.ProductsList })));
const ProductEditor = React.lazy(() => import('./pages/ProductEditor').then((m) => ({ default: m.ProductEditor })));
const Categories = React.lazy(() => import('./pages/Categories').then((m) => ({ default: m.Categories })));
const Inventory = React.lazy(() => import('./pages/Inventory').then((m) => ({ default: m.Inventory })));
const OrdersList = React.lazy(() => import('./pages/OrdersList').then((m) => ({ default: m.OrdersList })));
const OrderDetail = React.lazy(() => import('./pages/OrderDetail').then((m) => ({ default: m.OrderDetail })));
const CustomersList = React.lazy(() => import('./pages/CustomersList').then((m) => ({ default: m.CustomersList })));
const CustomerDetail = React.lazy(() => import('./pages/CustomerDetail').then((m) => ({ default: m.CustomerDetail })));
const Coupons = React.lazy(() => import('./pages/Coupons').then((m) => ({ default: m.Coupons })));
const MediaLibrary = React.lazy(() => import('./pages/MediaLibrary').then((m) => ({ default: m.MediaLibrary })));
const WebsiteContent = React.lazy(() => import('./pages/WebsiteContent').then((m) => ({ default: m.WebsiteContent })));
const Analytics = React.lazy(() => import('./pages/Analytics').then((m) => ({ default: m.Analytics })));
const Settings = React.lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));

function AdminPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#FF6B35] border-t-transparent" />
    </div>
  );
}

export function AdminRouter() {
  React.useEffect(() => {
    const cleanupRealtime = initSupabaseRealtime();
    return () => {
      cleanupRealtime();
    };
  }, []);

  return (
    <AdminAuthProvider>
      <ToastProvider>
        <React.Suspense fallback={<AdminPageLoader />}>
          <Routes>
            {/* Public Admin Auth Routes */}
            <Route path="login" element={<AdminLogin />} />
            <Route path="forgot-password" element={<AdminForgotPassword />} />

            {/* Protected Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductsList />} />
              <Route path="products/new" element={<ProductEditor />} />
              <Route path="products/:id" element={<ProductEditor />} />
              <Route path="categories" element={<Categories />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="orders" element={<OrdersList />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="customers" element={<CustomersList />} />
              <Route path="customers/:id" element={<CustomerDetail />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="website-content" element={<WebsiteContent />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all unknown admin subpaths */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </React.Suspense>
      </ToastProvider>
    </AdminAuthProvider>
  );
}
