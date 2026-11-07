import * as React from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  History,
  Edit3,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { AdminProduct, ProductVariant, InventoryLog } from '../lib/types';
import { Modal } from '../components/ui/Modal';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { exportToCsv } from '../lib/csvExport';

export function Inventory() {
  const { user } = useAdminAuth();
  const { showToast } = useAdminToast();

  const [products, setProducts] = React.useState<AdminProduct[]>([]);
  const [logs, setLogs] = React.useState<InventoryLog[]>([]);
  const [search, setSearch] = React.useState('');
  const [healthFilter, setHealthFilter] = React.useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [showLogsModal, setShowLogsModal] = React.useState(false);

  // Adjustment Modal
  const [adjustTarget, setAdjustTarget] = React.useState<{
    product: AdminProduct;
    variant: ProductVariant;
  } | null>(null);
  const [newStockVal, setNewStockVal] = React.useState<number>(0);
  const [adjustReason, setAdjustReason] = React.useState<InventoryLog['reason']>('restock');
  const [adjustNote, setAdjustNote] = React.useState('');

  const loadData = () => {
    setProducts(storeService.getProducts());
    setLogs(storeService.getInventoryLogs());
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('funkyfox:store_updated', loadData);
    return () => window.removeEventListener('funkyfox:store_updated', loadData);
  }, []);

  // Compute Overall Statistics
  const totalUnits = products.reduce((sum, p) => sum + p.totalStock, 0);
  const lowStockCount = products.filter((p) => p.totalStock <= p.lowStockThreshold && p.totalStock > 0).length;
  const outOfStockCount = products.filter((p) => p.totalStock === 0).length;

  // Flatten products into variant rows
  const variantRows = React.useMemo(() => {
    const list: Array<{ product: AdminProduct; variant: ProductVariant }> = [];
    products.forEach((p) => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => list.push({ product: p, variant: v }));
      } else {
        // Mock fallback variant
        list.push({
          product: p,
          variant: {
            id: `${p.id}-default`,
            productId: p.id,
            size: 'Standard',
            colorName: 'Standard',
            colorHex: '#171717',
            sku: p.sku,
            stock: p.totalStock,
            inStock: p.totalStock > 0,
          },
        });
      }
    });

    return list.filter(({ product, variant }) => {
      const matchSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        variant.sku.toLowerCase().includes(search.toLowerCase()) ||
        variant.colorName.toLowerCase().includes(search.toLowerCase());

      const threshold = product.lowStockThreshold || 5;
      const isLow = variant.stock <= threshold && variant.stock > 0;
      const isOut = variant.stock === 0;
      const isIn = variant.stock > threshold;

      if (healthFilter === 'low_stock') return matchSearch && isLow;
      if (healthFilter === 'out_of_stock') return matchSearch && isOut;
      if (healthFilter === 'in_stock') return matchSearch && isIn;
      return matchSearch;
    });
  }, [products, search, healthFilter]);

  const handleQuickIncrement = (product: AdminProduct, variant: ProductVariant, amount: number) => {
    const newStock = Math.max(0, variant.stock + amount);
    storeService.adjustVariantStock(
      product.id,
      variant.id,
      newStock,
      'restock',
      `Quick restock +${amount}`,
      user?.name || 'Administrator'
    );
    showToast(`Updated ${variant.sku} stock to ${newStock} units`, 'success');
    loadData();
  };

  const handleQuickDecrement = (product: AdminProduct, variant: ProductVariant) => {
    if (variant.stock <= 0) return;
    const newStock = variant.stock - 1;
    storeService.adjustVariantStock(
      product.id,
      variant.id,
      newStock,
      'manual_adjustment',
      'Quick deduction -1',
      user?.name || 'Administrator'
    );
    showToast(`Decreased ${variant.sku} stock to ${newStock} units`, 'info');
    loadData();
  };

  const openAdjustment = (product: AdminProduct, variant: ProductVariant) => {
    setAdjustTarget({ product, variant });
    setNewStockVal(variant.stock);
    setAdjustReason('restock');
    setAdjustNote('');
  };

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;

    storeService.adjustVariantStock(
      adjustTarget.product.id,
      adjustTarget.variant.id,
      newStockVal,
      adjustReason,
      adjustNote,
      user?.name || 'Administrator'
    );

    showToast(
      `Adjusted stock for ${adjustTarget.variant.sku} to ${newStockVal} units (${adjustReason})`,
      'success'
    );
    setAdjustTarget(null);
    loadData();
  };

  const handleExportLogs = () => {
    const rows = logs.map((l) => ({
      Timestamp: l.createdAt,
      Product: l.productName,
      SKU: l.sku,
      Variant: l.variantLabel || '',
      PreviousStock: l.previousQuantity,
      NewStock: l.newQuantity,
      NetChange: l.change > 0 ? `+${l.change}` : l.change,
      Reason: l.reason,
      Note: l.note || '',
      AdminUser: l.adminName,
    }));
    exportToCsv('funkyfox_inventory_movement_history', rows);
    showToast('Exported inventory audit logs to CSV', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 font-display">
            Inventory & Stock Control
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Real-time variant-level tracking, threshold monitoring, and stock movement audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportLogs}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl hover:bg-zinc-50 transition-colors shadow-sm"
          >
            <Download size={14} /> Export Audit Log
          </button>
          <button
            type="button"
            onClick={() => setShowLogsModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <History size={14} /> Movement History ({logs.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Units in Stock</p>
            <p className="text-2xl font-black text-zinc-900 mt-1">{totalUnits.toLocaleString('en-IN')}</p>
            <span className="text-[11px] text-zinc-400">across all catalogue variants</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center">
            <Boxes size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Low Stock Variants</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{lowStockCount}</p>
            <span className="text-[11px] text-zinc-400">below restock threshold</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Depleted / Stockout</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{outOfStockCount}</p>
            <span className="text-[11px] text-zinc-400">zero stock remaining</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle size={24} />
          </div>
        </div>
      </div>

      {/* Search & Health Filter */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search variant by SKU, style name, or colour..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setHealthFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              healthFilter === 'all'
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
            }`}
          >
            All Stock
          </button>
          <button
            type="button"
            onClick={() => setHealthFilter('low_stock')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              healthFilter === 'low_stock'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
            }`}
          >
            Low Stock
          </button>
          <button
            type="button"
            onClick={() => setHealthFilter('out_of_stock')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              healthFilter === 'out_of_stock'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
            }`}
          >
            Depleted
          </button>
        </div>
      </div>

      {/* Variant Inventory Table */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Product & Variant</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Size / Colour</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Available Units</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4 text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {variantRows.slice(0, 50).map(({ product, variant }) => {
                const isOut = variant.stock === 0;
                const threshold = product.lowStockThreshold || 5;
                const isLow = variant.stock <= threshold && variant.stock > 0;

                return (
                  <tr key={`${product.id}-${variant.id}`} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-8 rounded-lg object-cover border border-zinc-200 shrink-0 bg-zinc-100"
                        />
                        <div>
                          <p className="font-bold text-zinc-900">{product.name}</p>
                          <p className="text-[11px] text-zinc-400">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-zinc-600">{variant.sku}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: variant.colorHex }}
                        />
                        <span className="font-medium text-zinc-800">{variant.colorName}</span>
                        <span className="text-zinc-400">/</span>
                        <span className="font-bold text-zinc-900">{variant.size}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900 tabular-nums">
                      ₹{(variant.price ?? product.price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-black text-zinc-900 tabular-nums">{variant.stock}</span>
                      <span className="text-[11px] text-zinc-400 ml-1">units</span>
                    </td>
                    <td className="py-3 px-4">
                      {isOut ? (
                        <Badge variant="error">Depleted (0)</Badge>
                      ) : isLow ? (
                        <Badge variant="warning">Low Stock ({variant.stock})</Badge>
                      ) : (
                        <Badge variant="success">Healthy ({variant.stock})</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {variant.stock > 0 && (
                          <button
                            type="button"
                            onClick={() => handleQuickDecrement(product, variant)}
                            className="h-7 w-7 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-bold text-zinc-600 flex items-center justify-center cursor-pointer transition-colors"
                            title="Decrement -1 unit"
                          >
                            -1
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleQuickIncrement(product, variant, 1)}
                          className="h-7 w-7 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-bold text-zinc-700 flex items-center justify-center cursor-pointer transition-colors"
                          title="Quick restock +1 unit"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickIncrement(product, variant, 5)}
                          className="h-7 px-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-bold text-zinc-700 flex items-center justify-center cursor-pointer transition-colors"
                          title="Quick restock +5 units"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => openAdjustment(product, variant)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 size={12} /> Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={Boolean(adjustTarget)}
        onClose={() => setAdjustTarget(null)}
        title="Adjust Inventory Stock Level"
        description={`Modify stock units and log reason for ${adjustTarget?.variant.sku}`}
      >
        {adjustTarget && (
          <form onSubmit={handleApplyAdjustment} className="space-y-4">
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-900">{adjustTarget.product.name}</p>
                <p className="text-[11px] text-zinc-500">
                  {adjustTarget.variant.colorName} / {adjustTarget.variant.size} ({adjustTarget.variant.sku})
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400">Current Qty</span>
                <p className="text-base font-black text-zinc-900">{adjustTarget.variant.stock}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                New Available Stock Units <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={newStockVal}
                onChange={(e) => setNewStockVal(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-sm font-bold bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              />
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Net change: {newStockVal - adjustTarget.variant.stock > 0 ? `+${newStockVal - adjustTarget.variant.stock}` : newStockVal - adjustTarget.variant.stock} units
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Adjustment Reason <span className="text-rose-500">*</span>
              </label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
              >
                <option value="restock">Restock / Fresh Shipment Inbound</option>
                <option value="order_fulfillment">Manual Order Allocation</option>
                <option value="customer_return">Customer Return Restock</option>
                <option value="damaged">Damaged / Written-off Unit</option>
                <option value="inventory_count">Physical Inventory Count Correction</option>
                <option value="manual_adjustment">General Operational Correction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Internal Audit Note
              </label>
              <input
                type="text"
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                placeholder="e.g. Received PO-8891 from Surat textiles..."
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
              />
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdjustTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#FF6B35] rounded-xl hover:bg-[#e05624] transition-colors shadow-sm"
              >
                Save Adjustment & Log
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Movement History Logs Modal */}
      <Modal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        title="Inventory Movement Audit Logs"
        description="Comprehensive chronological ledger of all stock additions, deductions, and reasons."
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto border border-zinc-200 rounded-xl">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No inventory changes logged yet. Any stock edits will appear here.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Product / SKU</th>
                    <th className="py-2.5 px-3">Change</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Authorizer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50/50">
                      <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-zinc-900">{log.productName}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{log.sku}</p>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-mono font-bold ${
                            log.change > 0
                              ? 'text-emerald-600'
                              : log.change < 0
                              ? 'text-rose-600'
                              : 'text-zinc-500'
                          }`}
                        >
                          {log.change > 0 ? `+${log.change}` : log.change}
                        </span>
                        <span className="text-[10px] text-zinc-400 ml-1">
                          ({log.previousQuantity} → {log.newQuantity})
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="capitalize font-medium text-zinc-800">
                          {log.reason.replace(/_/g, ' ')}
                        </span>
                        {log.note && <p className="text-[10px] text-zinc-400">{log.note}</p>}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-600">{log.adminName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowLogsModal(false)}
              className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-xl hover:bg-zinc-800"
            >
              Close Ledger
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
