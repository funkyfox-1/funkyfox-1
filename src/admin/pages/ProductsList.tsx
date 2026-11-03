import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  Copy,
  Trash2,
  Edit,
  Eye,
  MoreVertical,
  CheckSquare,
  Square,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Archive,
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { AdminProduct } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAdminToast } from '../context/ToastContext';
import { exportToCsv } from '../lib/csvExport';
import { EmptyState } from '../components/ui/EmptyState';

export function ProductsList() {
  const navigate = useNavigate();
  const { showToast } = useAdminToast();

  const [products, setProducts] = React.useState<AdminProduct[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [stockFilter, setStockFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState<'date-desc' | 'date-asc' | 'price-desc' | 'price-asc' | 'name'>('date-desc');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 12;

  // Confirm delete modal state
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  const loadData = () => {
    const list = storeService.getProducts();
    setProducts(list);
    const cats = storeService.getCategories().map((c) => c.name);
    setCategories(cats);
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('funkyfox:store_updated', loadData);
    return () => window.removeEventListener('funkyfox:store_updated', loadData);
  }, []);

  // Filter & Sort
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in_stock' && p.totalStock > p.lowStockThreshold) ||
        (stockFilter === 'low_stock' && p.totalStock <= p.lowStockThreshold && p.totalStock > 0) ||
        (stockFilter === 'out_of_stock' && p.totalStock === 0);

      return matchesSearch && matchesCat && matchesStatus && matchesStock;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date-asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, search, categoryFilter, statusFilter, stockFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Bulk Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Actions
  const handleDuplicate = (id: string) => {
    const dup = storeService.duplicateProduct(id);
    if (dup) {
      showToast(`Duplicated product "${dup.name}" as draft`, 'success');
      loadData();
    }
  };

  const handleDeleteOne = () => {
    if (!deleteTarget) return;
    storeService.deleteProduct(deleteTarget.id);
    showToast(`Deleted product "${deleteTarget.name}"`, 'success');
    setDeleteTarget(null);
    setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
    loadData();
  };

  const handleBulkDelete = () => {
    storeService.bulkDeleteProducts(selectedIds);
    showToast(`Permanently deleted ${selectedIds.length} products`, 'success');
    setSelectedIds([]);
    setBulkDeleteOpen(false);
    loadData();
  };

  const handleBulkStatus = (status: 'active' | 'draft' | 'archived') => {
    storeService.bulkUpdateStatus(selectedIds, status);
    showToast(`Updated status to ${status} for ${selectedIds.length} products`, 'success');
    setSelectedIds([]);
    loadData();
  };

  const handleExportCsv = () => {
    const exportRows = filteredProducts.map((p) => ({
      ID: p.id,
      Name: p.name,
      SKU: p.sku,
      Category: p.category,
      Price: p.price,
      MRP: p.originalPrice || '',
      CostPrice: p.costPrice || '',
      TotalStock: p.totalStock,
      Status: p.status,
      IsNew: p.isNew ? 'YES' : 'NO',
      IsBestseller: p.isBestseller ? 'YES' : 'NO',
      CreatedAt: p.createdAt,
    }));
    exportToCsv('funkyfox_products_catalog', exportRows);
    showToast('Exported product catalogue to CSV', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 font-display">
            Product Catalogue
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Manage your store's items, pricing, inventory stock, and storefront visibility.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl hover:bg-zinc-50 transition-colors shadow-sm"
          >
            <Download size={14} /> Export CSV
          </button>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl hover:bg-[#e05624] transition-colors shadow-sm"
          >
            <Plus size={15} /> Add Product
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, SKU, or department..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all text-zinc-900"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-zinc-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-zinc-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active / Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-zinc-700 focus:outline-none"
          >
            <option value="all">All Inventory</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock (≤ 5)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-zinc-700 focus:outline-none"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="name">Product Name (A-Z)</option>
          </select>
        </div>

        {/* Bulk Action Bar (when selected) */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/80 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#FF6B35]">
                {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkStatus('active')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                Publish Selected
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatus('draft')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                Set as Draft
              </button>
              <button
                type="button"
                onClick={() => setBulkDeleteOpen(true)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-rose-300 text-rose-700 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} /> Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={<Filter size={28} />}
            title="No matching products found"
            description="Try adjusting your filter settings, search terms, or add a new product to your catalogue."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearch('');
              setCategoryFilter('all');
              setStatusFilter('all');
              setStockFilter('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-zinc-400 hover:text-zinc-700"
                    >
                      {selectedIds.length > 0 && selectedIds.length === paginatedProducts.length ? (
                        <CheckSquare size={16} className="text-[#FF6B35]" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">MRP</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginatedProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isLowStock = p.totalStock <= p.lowStockThreshold && p.totalStock > 0;
                  const isOutOfStock = p.totalStock === 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-zinc-50/70 transition-colors ${
                        isSelected ? 'bg-orange-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(p.id)}
                          className="text-zinc-400 hover:text-zinc-700"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-[#FF6B35]" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-11 w-9 rounded-lg object-cover border border-zinc-200 shrink-0 bg-zinc-100"
                          />
                          <div className="min-w-0 max-w-xs">
                            <Link
                              to={`/admin/products/${p.id}`}
                              className="font-bold text-zinc-900 hover:text-[#FF6B35] transition-colors truncate block"
                            >
                              {p.name}
                            </Link>
                            <span className="text-[11px] text-zinc-400 truncate block">
                              {p.variants?.length || 0} variant combinations
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-600 font-semibold">{p.sku}</td>
                      <td className="py-3.5 px-4 text-zinc-700 font-medium">{p.category}</td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 line-through">
                        {p.originalPrice ? `₹${p.originalPrice.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" /> Out of stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {p.totalStock} left
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {p.totalStock} units
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            p.status === 'active'
                              ? 'success'
                              : p.status === 'draft'
                              ? 'neutral'
                              : 'warning'
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/products/${p.id}`}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                            title="Edit Product"
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(p.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                            title="Duplicate Product"
                          >
                            <Copy size={14} />
                          </button>
                          <a
                            href={`/products/${p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                            title="View on Storefront"
                          >
                            <Eye size={14} />
                          </a>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: p.id, name: p.name })}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredProducts.length > pageSize && (
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} products
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 font-semibold text-zinc-900">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteOne}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action removes the product and its variants from the store.`}
        confirmLabel="Delete Product"
        isDestructive={true}
      />

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Products"
        message={`Are you sure you want to permanently delete ${selectedIds.length} selected products? This action cannot be undone.`}
        confirmLabel="Bulk Delete"
        isDestructive={true}
      />
    </div>
  );
}
