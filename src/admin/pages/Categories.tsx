import * as React from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Layers, ArrowUpDown, Image as ImageIcon } from 'lucide-react';
import { storeService } from '../services/storeService';
import { AdminCategory } from '../lib/types';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAdminToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';

export function Categories() {
  const { showToast } = useAdminToast();
  const [categories, setCategories] = React.useState<AdminCategory[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<AdminCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminCategory | null>(null);

  // Form State
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [image, setImage] = React.useState('/images/category-tshirts.jpg');
  const [isVisible, setIsVisible] = React.useState(true);
  const [order, setOrder] = React.useState(1);

  const loadData = () => {
    setCategories(storeService.getCategories());
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('funkyfox:store_updated', loadData);
    return () => window.removeEventListener('funkyfox:store_updated', loadData);
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('/images/category-tshirts.jpg');
    setIsVisible(true);
    setOrder(categories.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (cat: AdminCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImage(cat.image);
    setIsVisible(cat.isVisible);
    setOrder(cat.order);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is mandatory', 'error');
      return;
    }

    const catId = editingCategory ? editingCategory.id : slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const updated: AdminCategory = {
      id: catId,
      name: name.trim(),
      slug: slug || catId,
      description,
      image,
      isVisible,
      order: Number(order),
      productCount: editingCategory?.productCount || 0,
    };

    storeService.saveCategory(updated);
    showToast(`Category "${updated.name}" saved`, 'success');
    setModalOpen(false);
    loadData();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    storeService.deleteCategory(deleteTarget.id);
    showToast(`Deleted category "${deleteTarget.name}"`, 'info');
    setDeleteTarget(null);
    loadData();
  };

  const toggleVisibility = (cat: AdminCategory) => {
    storeService.saveCategory({ ...cat, isVisible: !cat.isVisible });
    showToast(`Category ${cat.name} visibility updated`, 'success');
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 font-display">
            Category Management
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Structure your storefront taxonomy, navigation banners, and shopping filters.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl hover:bg-[#e05624] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={15} /> Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
          >
            {/* Image Preview */}
            <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
              <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                <Badge variant={cat.isVisible ? 'success' : 'neutral'}>
                  {cat.isVisible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-zinc-900">{cat.name}</h3>
                  <span className="text-[10px] font-mono text-zinc-400">Order: {cat.order}</span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">/{cat.slug}</p>
                <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                  {cat.description || 'No description added.'}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleVisibility(cat)}
                  className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                >
                  {cat.isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{cat.isVisible ? 'Hide' : 'Show'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                    title="Edit category"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cat)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Editor Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        description="Configure department title, display order, and cover banner."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Outerwear & Jackets"
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="outerwear-jackets"
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief department overview..."
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Cover Image URL
            </label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/images/category-jackets.jpg"
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Visibility
              </label>
              <select
                value={isVisible ? 'visible' : 'hidden'}
                onChange={(e) => setIsVisible(e.target.value === 'visible')}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
              >
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#FF6B35] rounded-xl hover:bg-[#e05624] transition-colors shadow-sm"
            >
              Save Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Existing products in this category will remain, but the category navigation group will be removed.`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
}
