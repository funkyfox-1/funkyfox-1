import * as React from 'react';
import { Plus, Tag, Edit2, Trash2, Copy, CheckCircle2, Percent, DollarSign, Calendar } from 'lucide-react';
import { storeService } from '../services/storeService';
import { AdminCoupon } from '../lib/types';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAdminToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';

export function Coupons() {
  const { showToast } = useAdminToast();
  const [coupons, setCoupons] = React.useState<AdminCoupon[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingCoupon, setEditingCoupon] = React.useState<AdminCoupon | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminCoupon | null>(null);

  // Form State
  const [code, setCode] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [discountType, setDiscountType] = React.useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = React.useState<number>(10);
  const [minPurchaseAmount, setMinPurchaseAmount] = React.useState<number>(999);
  const [maxDiscountAmount, setMaxDiscountAmount] = React.useState<number | undefined>(300);
  const [usageLimit, setUsageLimit] = React.useState<number>(100);
  const [perCustomerLimit, setPerCustomerLimit] = React.useState<number>(1);
  const [startDate, setStartDate] = React.useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = React.useState(() =>
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [isActive, setIsActive] = React.useState(true);

  const loadData = () => {
    setCoupons(storeService.getCoupons());
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('funkyfox:store_updated', loadData);
    return () => window.removeEventListener('funkyfox:store_updated', loadData);
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinPurchaseAmount(999);
    setMaxDiscountAmount(300);
    setUsageLimit(100);
    setPerCustomerLimit(1);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (coup: AdminCoupon) => {
    setEditingCoupon(coup);
    setCode(coup.code);
    setDescription(coup.description || '');
    setDiscountType(coup.discountType);
    setDiscountValue(coup.discountValue);
    setMinPurchaseAmount(coup.minPurchaseAmount);
    setMaxDiscountAmount(coup.maxDiscountAmount);
    setUsageLimit(coup.usageLimit);
    setPerCustomerLimit(coup.perCustomerLimit);
    setStartDate(coup.startDate.split('T')[0]);
    setEndDate(coup.endDate.split('T')[0]);
    setIsActive(coup.isActive);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('Coupon promo code is mandatory', 'error');
      return;
    }

    const coupId = editingCoupon ? editingCoupon.id : `coup-${Date.now()}`;
    const updated: AdminCoupon = {
      id: coupId,
      code: code.trim().toUpperCase(),
      description,
      discountType,
      discountValue: Number(discountValue),
      minPurchaseAmount: Number(minPurchaseAmount),
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      usageLimit: Number(usageLimit),
      usageCount: editingCoupon?.usageCount || 0,
      perCustomerLimit: Number(perCustomerLimit),
      isActive,
    };

    storeService.saveCoupon(updated);
    showToast(`Coupon ${updated.code} saved successfully`, 'success');
    setModalOpen(false);
    loadData();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    storeService.deleteCoupon(deleteTarget.id);
    showToast(`Deleted coupon ${deleteTarget.code}`, 'info');
    setDeleteTarget(null);
    loadData();
  };

  const copyCode = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    showToast(`Copied ${codeStr} to clipboard`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 font-display">
            Coupons & Discounts
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Create promotional codes, configure basket minimums, and track campaign usage limits.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl hover:bg-[#e05624] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={15} /> Create Coupon
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
          >
            {/* Top Accent Strip */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${
                coupon.isActive ? 'bg-[#FF6B35]' : 'bg-zinc-300'
              }`}
            />

            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => copyCode(coupon.code)}
                  className="font-mono font-black text-sm text-zinc-900 bg-zinc-100 hover:bg-orange-50 hover:text-[#FF6B35] px-2.5 py-1 rounded-lg border border-zinc-200 transition-colors flex items-center gap-1.5"
                  title="Click to copy code"
                >
                  <span>{coupon.code}</span>
                  <Copy size={12} className="text-zinc-400" />
                </button>
                <Badge variant={coupon.isActive ? 'success' : 'neutral'}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="text-base font-bold text-zinc-900">
                {coupon.discountType === 'percentage'
                  ? `${coupon.discountValue}% OFF`
                  : `₹${coupon.discountValue} FLAT DISCOUNT`}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {coupon.description || 'Applicable on qualifying checkout carts.'}
              </p>

              <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Min. Cart Value:</span>
                  <span className="font-semibold text-zinc-800">₹{coupon.minPurchaseAmount}</span>
                </div>
                {coupon.maxDiscountAmount && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Max Cap:</span>
                    <span className="font-semibold text-zinc-800">₹{coupon.maxDiscountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-400">Redemptions:</span>
                  <span className="font-semibold text-zinc-800">
                    {coupon.usageCount} / {coupon.usageLimit}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400 pt-1">
                  <span>Expires:</span>
                  <span>{new Date(coupon.endDate).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => openEditModal(coupon)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                title="Edit coupon"
              >
                <Edit2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(coupon)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete coupon"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCoupon ? 'Edit Coupon Promo' : 'Create New Coupon'}
        description="Configure discount rules, threshold restrictions, and campaign expiry."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Coupon Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="FESTIVE20"
                className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed INR (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Discount Value
              </label>
              <input
                type="number"
                min="1"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Min. Cart (₹)
              </label>
              <input
                type="number"
                min="0"
                value={minPurchaseAmount}
                onChange={(e) => setMinPurchaseAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Max Cap (₹)
              </label>
              <input
                type="number"
                min="0"
                value={maxDiscountAmount || ''}
                onChange={(e) =>
                  setMaxDiscountAmount(e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="Optional"
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 15% off for first order"
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Total Redemptions Cap
              </label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(parseInt(e.target.value) || 100)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#FF6B35] rounded-xl hover:bg-[#e05624] shadow-sm"
            >
              Save Coupon
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={`Are you sure you want to deactivate and remove coupon "${deleteTarget?.code}"?`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
}
