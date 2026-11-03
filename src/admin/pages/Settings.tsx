import * as React from 'react';
import {
  Save,
  Building,
  Shield,
  FileText,
  Clock,
  Users,
  Bell,
  CheckCircle2,
  AlertCircle,
  Plus,
  Mail,
  UserCheck,
  Percent,
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { SupabaseDbService } from '../services/supabaseDbService';
import { StoreSettings } from '../lib/types';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export function Settings() {
  const { user, hasRole } = useAdminAuth();
  const { showToast } = useAdminToast();

  const [settings, setSettings] = React.useState<StoreSettings>(storeService.getSettings());
  const [activeTab, setActiveTab] = React.useState<'general' | 'commerce' | 'staff' | 'policies' | 'notifications' | 'audit'>('general');
  const [auditLogs, setAuditLogs] = React.useState(storeService.getAuditLogs());
  const [adminUsers, setAdminUsers] = React.useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState<boolean>(false);

  // Staff Modal
  const [showStaffModal, setShowStaffModal] = React.useState(false);
  const [staffEmail, setStaffEmail] = React.useState('');
  const [staffName, setStaffName] = React.useState('');
  const [staffRole, setStaffRole] = React.useState<'admin' | 'manager'>('manager');
  const [assigningRole, setAssigningRole] = React.useState(false);

  React.useEffect(() => {
    if (activeTab === 'staff') {
      loadStaff();
    }
  }, [activeTab]);

  const loadStaff = async () => {
    setLoadingStaff(true);
    try {
      const users = await SupabaseDbService.fetchAdminUsers();
      setAdminUsers(users);
    } catch (e) {
      console.warn('Could not load staff list:', e);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      storeService.saveSettings(settings, user?.name || 'Administrator');
      showToast('Store settings updated and synchronized successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to persist settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail.trim() || !staffName.trim()) {
      showToast('Please specify a staff name and email address.', 'error');
      return;
    }

    setAssigningRole(true);
    const result = await SupabaseDbService.assignAdminRole(staffEmail, staffRole, staffName);
    setAssigningRole(false);

    if (result.success) {
      showToast(`Role clearance '${staffRole}' assigned to ${staffEmail}.`, 'success');
      setShowStaffModal(false);
      setStaffEmail('');
      setStaffName('');
      loadStaff();
    } else {
      showToast(result.error || 'Failed to update administrative permissions.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 font-display">
            Store Administration & Settings
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Configure global brand identity, commerce rules, staff access control, and operational policies.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl hover:bg-[#e05624] transition-colors shadow-sm self-start sm:self-auto disabled:opacity-50 cursor-pointer"
        >
          <Save size={15} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 bg-white px-6 rounded-t-2xl overflow-x-auto scrollbar-none">
        {[
          { id: 'general', label: '1. Store Identity', icon: Building },
          { id: 'commerce', label: '2. Storefront & Commerce', icon: Percent },
          { id: 'staff', label: '3. Staff & Permissions', icon: Users },
          { id: 'policies', label: '4. Legal Policies', icon: FileText },
          { id: 'notifications', label: '5. Notifications', icon: Bell },
          { id: 'audit', label: '6. Operational Audit Trail', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#FF6B35] text-[#FF6B35]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GENERAL IDENTITY */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Brand Profile & Physical Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Tagline</label>
              <input
                type="text"
                value={settings.storeTagline}
                onChange={(e) => setSettings({ ...settings, storeTagline: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Customer Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Support Telephone</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Warehouse / Registered Address</label>
            <textarea
              rows={3}
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl hover:bg-[#e05624] shadow-sm cursor-pointer"
            >
              Update Store Identity
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: STOREFRONT & COMMERCE */}
      {activeTab === 'commerce' && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Regional Commerce & Tax Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Store Base Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
              >
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Standard GST Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.taxGstRate}
                onChange={(e) =>
                  setSettings({ ...settings, taxGstRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white font-bold"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Standard GST rate across India apparel (default: 18%).
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                value={settings.freeShippingThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white font-bold"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Carts above this amount qualify for zero freight.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={settings.standardShippingFee}
                onChange={(e) =>
                  setSettings({ ...settings, standardShippingFee: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white font-bold"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Standard doorstep shipping fee.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Return Window (Days)
              </label>
              <input
                type="number"
                min="0"
                value={settings.returnWindowDays}
                onChange={(e) =>
                  setSettings({ ...settings, returnWindowDays: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white font-bold"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Permitted window for customer exchanges.
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl hover:bg-[#e05624] shadow-sm cursor-pointer"
            >
              Update Commerce Rules
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: STAFF & RBAC PERMISSIONS */}
      {activeTab === 'staff' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Staff & Role-Based Access Control (RBAC)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Manage administrative personnel and assign security clearance tiers.
              </p>
            </div>
            {hasRole(['super_admin']) && (
              <button
                type="button"
                onClick={() => setShowStaffModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
              >
                <Plus size={14} /> Assign Staff Role
              </button>
            )}
          </div>

          {/* Role tiers explanation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-950">
              <span className="font-bold block text-purple-800">Super Admin</span>
              <p className="mt-1 text-[11px] text-purple-700 leading-relaxed">
                Full administrative authority: Catalog, finance, staff assignment, destructive operations.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950">
              <span className="font-bold block text-blue-800">Admin</span>
              <p className="mt-1 text-[11px] text-blue-700 leading-relaxed">
                Operations management: Product catalog, orders, inventory updates, and customer records.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950">
              <span className="font-bold block text-amber-800">Manager</span>
              <p className="mt-1 text-[11px] text-amber-700 leading-relaxed">
                Restricted operations: Order fulfillment status, customer support, and stock tracking.
              </p>
            </div>
          </div>

          {/* Staff Table */}
          {loadingStaff ? (
            <div className="py-8 text-center text-xs text-zinc-400">Loading authorized administrators...</div>
          ) : adminUsers.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-zinc-50 border border-dashed border-zinc-200 text-xs text-zinc-500">
              <UserCheck size={28} className="mx-auto text-zinc-400 mb-2" />
              <p className="font-semibold text-zinc-700">Staff records loaded from Supabase Auth.</p>
              <p className="text-[11px] text-zinc-400 mt-1">Currently logged in as {user?.email} ({user?.role}).</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Clearance Role</th>
                    <th className="py-3 px-4">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {adminUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/80">
                      <td className="py-3 px-4 font-semibold text-zinc-900">{u.name}</td>
                      <td className="py-3 px-4 text-zinc-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            u.role === 'super_admin'
                              ? 'info'
                              : u.role === 'admin'
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 text-[11px]">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LEGAL POLICIES */}
      {activeTab === 'policies' && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Customer Legal Agreements & Storefront Policies
          </h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Return & Exchange Policy
            </label>
            <textarea
              rows={4}
              value={settings.policies.returnPolicy}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  policies: { ...settings.policies, returnPolicy: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Privacy Policy Statement
            </label>
            <textarea
              rows={4}
              value={settings.policies.privacyPolicy}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  policies: { ...settings.policies, privacyPolicy: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Terms & Conditions of Service
            </label>
            <textarea
              rows={4}
              value={settings.policies.termsAndConditions}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  policies: { ...settings.policies, termsAndConditions: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl hover:bg-[#e05624] shadow-sm cursor-pointer"
            >
              Update Legal Terms
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Automated Staff & Customer Notifications
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-900 block">Critical Low Stock Threshold Alerts</span>
                <span className="text-[11px] text-zinc-500">
                  Notify store managers when variant units drop below 5 pieces.
                </span>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-900 block">Customer Order Confirmation</span>
                <span className="text-[11px] text-zinc-500">
                  Dispatch email receipt and order details upon transaction completion.
                </span>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-900 block">Dispatch & Tracking Notification</span>
                <span className="text-[11px] text-zinc-500">
                  Notify customer automatically when shipping status transitions to Shipped.
                </span>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Staff Operations Ledger ({auditLogs.length} Records)
            </h3>
            <span className="text-[10px] text-zinc-400">Immutable chronological activity log</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-400">
                      No operational logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.slice(0, 30).map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50/80 font-sans">
                      <td className="py-2.5 px-4 text-zinc-400 font-mono text-[10px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-zinc-800">{log.adminName}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono text-[10px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-zinc-600">
                        {log.resourceType}: <span className="font-mono">{log.resourceId}</span>
                      </td>
                      <td className="py-2.5 px-4 text-zinc-600 max-w-xs truncate">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Assignment Modal */}
      {showStaffModal && (
        <Modal
          isOpen={showStaffModal}
          onClose={() => setShowStaffModal(false)}
          title="Assign Administrator Role"
        >
          <form onSubmit={handleAssignRole} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Staff Full Name</label>
              <input
                type="text"
                required
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Staff Account Email</label>
              <input
                type="email"
                required
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                placeholder="staff@funkyfox.in"
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Must correspond to an authenticated Supabase user account.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Clearance Role</label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
              >
                <option value="admin">Admin (Catalogue, Orders, Customers)</option>
                <option value="manager">Manager (Fulfillment & Support Only)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assigningRole}
                className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
              >
                {assigningRole ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
