import * as React from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Download, Eye, Mail, Phone, Calendar, ArrowRight } from 'lucide-react';
import { storeService } from '../services/storeService';
import { AdminCustomer } from '../lib/types';
import { exportToCsv } from '../lib/csvExport';
import { useAdminToast } from '../context/ToastContext';
import { EmptyState } from '../components/ui/EmptyState';

export function CustomersList() {
  const { showToast } = useAdminToast();
  const [customers, setCustomers] = React.useState<AdminCustomer[]>([]);
  const [search, setSearch] = React.useState('');

  const loadData = () => {
    setCustomers(storeService.getCustomers());
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('funkyfox:store_updated', loadData);
    return () => window.removeEventListener('funkyfox:store_updated', loadData);
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleExportCsv = () => {
    const rows = filteredCustomers.map((c) => ({
      ID: c.id,
      Name: c.name,
      Email: c.email,
      Phone: c.phone,
      TotalOrders: c.totalOrders,
      TotalSpent: c.totalSpent,
      LastOrderDate: c.lastOrderDate || '',
      JoinedDate: c.createdAt,
    }));
    exportToCsv('funkyfox_customers_directory', rows);
    showToast('Exported customer list to CSV', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 font-display">
            Customer Directory
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            View shopper accounts, purchase history, lifetime value, and order engagement.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl hover:bg-zinc-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or telephone number..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title="No customers found"
            description="No customer records match your current query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Lifetime Spend</th>
                  <th className="py-3 px-4">Last Order</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-zinc-100 text-zinc-700 font-bold flex items-center justify-center shrink-0 border border-zinc-200">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            to={`/admin/customers/${c.id}`}
                            className="font-bold text-zinc-900 hover:text-[#FF6B35] transition-colors"
                          >
                            {c.name}
                          </Link>
                          <span className="text-[11px] text-zinc-400 block">
                            Customer since {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-zinc-800">{c.email}</p>
                      <p className="text-[11px] text-zinc-400">{c.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-800">{c.totalOrders} orders</td>
                    <td className="py-3.5 px-4 font-black text-zinc-900">
                      ₹{c.totalSpent.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500">
                      {c.lastOrderDate
                        ? new Date(c.lastOrderDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/customers/${c.id}`}
                        className="px-3 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={13} /> View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
