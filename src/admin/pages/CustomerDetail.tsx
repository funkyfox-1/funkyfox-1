import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  CreditCard,
  MapPin,
  Save,
  Clock,
  Eye,
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { AdminCustomer, AdminOrder } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import { useAdminToast } from '../context/ToastContext';

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useAdminToast();

  const [customer, setCustomer] = React.useState<AdminCustomer | undefined>(undefined);
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [notes, setNotes] = React.useState('');

  const loadData = () => {
    if (id) {
      const c = storeService.getCustomerById(id);
      setCustomer(c);
      if (c) {
        setNotes(c.notes || '');
        const allOrders = storeService.getOrders();
        const customerOrders = allOrders.filter(
          (o) => o.customer.id === c.id || o.customer.email.toLowerCase() === c.email.toLowerCase()
        );
        setOrders(customerOrders);
      }
    }
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('funkyfox:store_updated', loadData);
    return () => window.removeEventListener('funkyfox:store_updated', loadData);
  }, [id]);

  if (!customer) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200">
        <p className="text-sm text-zinc-500">Customer record not found.</p>
        <Link to="/admin/customers" className="mt-3 inline-block text-xs font-bold text-[#FF6B35]">
          ← Back to Customer Directory
        </Link>
      </div>
    );
  }

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    storeService.saveCustomerNote(customer.id, notes);
    showToast('Customer notes updated', 'success');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/customers"
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white font-black text-lg flex items-center justify-center">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-zinc-900 font-display">
                {customer.name}
              </h1>
              <p className="text-xs text-zinc-400">
                Registered {new Date(customer.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-[11px] text-zinc-400 uppercase font-bold block">Lifetime Value</span>
            <span className="text-lg font-black text-zinc-900">₹{customer.totalSpent.toLocaleString('en-IN')}</span>
          </div>
          <div className="border-l border-zinc-200 pl-4">
            <span className="text-[11px] text-zinc-400 uppercase font-bold block">Total Orders</span>
            <span className="text-lg font-black text-zinc-900">{customer.totalOrders}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Order History ({orders.length})
              </h2>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No orders logged for this customer yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {orders.map((o) => (
                  <div key={o.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-zinc-50/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/orders/${o.id}`}
                          className="font-bold text-xs text-zinc-900 hover:text-[#FF6B35]"
                        >
                          {o.orderNumber}
                        </Link>
                        <Badge
                          variant={
                            o.shippingStatus === 'delivered'
                              ? 'success'
                              : o.shippingStatus === 'shipped'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {o.shippingStatus}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })} ·{' '}
                        {o.items.length} item{o.items.length > 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-zinc-900">
                        ₹{o.total.toLocaleString('en-IN')}
                      </span>
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                      >
                        <Eye size={15} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Addresses */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[#FF6B35]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Saved Shipping Addresses
              </h2>
            </div>

            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customer.addresses.map((addr) => (
                  <div key={addr.id} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs text-zinc-700 space-y-1">
                    <p className="font-bold text-zinc-900">{customer.name}</p>
                    <p>{addr.street}</p>
                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p>{addr.country}</p>
                    {addr.isDefault && (
                      <span className="inline-block px-2 py-0.5 mt-2 rounded bg-orange-100 text-[#FF6B35] text-[10px] font-bold">
                        Default Address
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400">No saved address cards on file.</p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Customer Details & Internal CRM Notes */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Contact Details
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-700">
                <Mail size={14} className="text-zinc-400" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-700">
                <Phone size={14} className="text-zinc-400" />
                <span>{customer.phone}</span>
              </div>
            </div>
          </div>

          {/* CRM Internal Notes */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Staff CRM Notes
            </h2>
            <form onSubmit={handleSaveNotes} className="space-y-3">
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VIP customer notes, size preferences, return history..."
                className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              />
              <button
                type="submit"
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <Save size={13} /> Save CRM Notes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
