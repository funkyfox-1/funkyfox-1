import * as React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { AdminProduct, ProductVariant } from '../lib/types';
import { ImageUploader } from '../components/forms/ImageUploader';
import { VariantMatrix } from '../components/forms/VariantMatrix';
import { useAdminToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export function ProductEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { showToast } = useAdminToast();

  const [categories, setCategories] = React.useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'general' | 'variants' | 'media' | 'seo'>('general');

  // Form State
  const [formData, setFormData] = React.useState<Partial<AdminProduct>>({
    name: '',
    slug: '',
    sku: '',
    shortDescription: '',
    description: '',
    details: ['100% Breathable fabric', 'Durable tailored stitching', 'Machine wash gentle cold'],
    price: 999,
    originalPrice: 1299,
    costPrice: 450,
    taxRate: 18,
    category: 'T-Shirts',
    subcategory: 'Crew Necks',
    brand: 'Funky Fox',
    tags: ['everyday', 'casual'],
    image: '/images/product-tshirt.webp',
    images: ['/images/product-tshirt.webp'],
    alt: '',
    status: 'active',
    isNew: true,
    isBestseller: false,
    featuredOrder: 1,
    totalStock: 30,
    lowStockThreshold: 5,
    allowBackorders: false,
    variants: [],
    seoTitle: '',
    seoDescription: '',
  });

  React.useEffect(() => {
    const cats = storeService.getCategories().map((c) => c.name);
    setCategories(cats);

    if (!isNew && id) {
      const existing = storeService.getProductById(id);
      if (existing) {
        setFormData(existing);
      } else {
        showToast('Product not found, redirected to create mode', 'info');
        navigate('/admin/products/new', { replace: true });
      }
    } else {
      // Auto-generate starting SKU
      const randomId = Math.floor(1000 + Math.random() * 9000);
      setFormData((prev) => ({
        ...prev,
        sku: `FF-PROD-${randomId}`,
      }));
    }
  }, [id, isNew, navigate]);

  // Auto-generate slug and SEO from name if not manually modified
  const handleNameChange = (newName: string) => {
    const autoSlug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: prev.slug === '' || prev.slug === autoSlug.slice(0, -1) ? autoSlug : prev.slug,
      seoTitle: prev.seoTitle ? prev.seoTitle : `${newName} | Funky Fox Official`,
      alt: prev.alt ? prev.alt : `${newName} product photograph`,
    }));
  };

  const handleSave = (publishStatus?: 'active' | 'draft') => {
    if (!formData.name?.trim()) {
      showToast('Product title is mandatory', 'error');
      setActiveTab('general');
      return;
    }

    if (!formData.sku?.trim()) {
      showToast('Product SKU is mandatory', 'error');
      setActiveTab('general');
      return;
    }

    if (!formData.price || formData.price <= 0) {
      showToast('Please specify a valid selling price', 'error');
      setActiveTab('general');
      return;
    }

    const prodId = isNew
      ? (formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
      : (formData.id as string);

    // Calculate total stock from variants if variants exist
    let totalStock = formData.totalStock || 0;
    if (formData.variants && formData.variants.length > 0) {
      totalStock = formData.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }

    const mainImage = formData.image || formData.images?.[0] || '/images/product-tshirt.webp';
    const imagesList = formData.images && formData.images.length > 0 ? formData.images : [mainImage];

    const finalProduct: AdminProduct = {
      ...(formData as AdminProduct),
      id: prodId,
      slug: formData.slug || prodId,
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
      status: publishStatus || formData.status || 'active',
      totalStock,
      image: mainImage,
      images: imagesList,
      variants: formData.variants || [],
      alt: formData.alt || formData.name,
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storeService.saveProduct(finalProduct);
    showToast(
      isNew
        ? `Successfully published "${finalProduct.name}" to store catalogue!`
        : `Changes saved for "${finalProduct.name}"`,
      'success'
    );
    navigate('/admin/products');
  };

  const handleDelete = () => {
    if (formData.id) {
      storeService.deleteProduct(formData.id);
      showToast(`Product "${formData.name}" removed`, 'info');
      navigate('/admin/products');
    }
  };

  // Discount calculation
  const discountPercent =
    formData.originalPrice && formData.price && formData.originalPrice > formData.price
      ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
      : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Save Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-zinc-900 font-display">
              {isNew ? 'Create New Product' : `Edit: ${formData.name}`}
            </h1>
            <p className="text-xs text-zinc-400">
              {isNew ? 'Define catalogue specifications and variants' : `SKU: ${formData.sku}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <a
                href={`/products/${formData.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Eye size={14} /> Preview
              </a>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Delete product"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => handleSave('draft')}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-300 rounded-xl hover:bg-zinc-50 transition-colors"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave('active')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#FF6B35] rounded-xl hover:bg-[#e05624] transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Save size={14} /> Publish & Save
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-200 bg-white px-6 rounded-t-2xl">
        {[
          { id: 'general', label: '1. General & Pricing' },
          { id: 'variants', label: '2. Variants & Matrix' },
          { id: 'media', label: '3. Image Gallery' },
          { id: 'seo', label: '4. SEO & Publishing' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-[#FF6B35] text-[#FF6B35]'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: GENERAL & PRICING */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Title & Descriptions */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Product Information
              </h3>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Classic Heavyweight Oversized Tee"
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35] text-zinc-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Short Tagline
                </label>
                <input
                  type="text"
                  value={formData.shortDescription || ''}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="e.g. Clean silhouette tailored for all-day comfort."
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Full Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe fabric weight, fit, stitching and styling details..."
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Pricing & Margins (INR)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Selling Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Original MRP (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPrice || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  />
                  {discountPercent !== null && discountPercent > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600 mt-1 inline-block">
                      {discountPercent}% OFF customer savings
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.costPrice || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  />
                  {formData.price && formData.costPrice ? (
                    <span className="text-[10px] font-semibold text-zinc-500 mt-1 inline-block">
                      Margin: ₹{formData.price - formData.costPrice} (
                      {Math.round(((formData.price - formData.costPrice) / formData.price) * 100)}%)
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Category, SKU & Badges */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Organization
              </h3>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Product SKU <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="FF-TEE-001"
                  className="w-full px-3.5 py-2 text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-zinc-900 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Brand Label
                </label>
                <input
                  type="text"
                  value={formData.brand || 'Funky Fox'}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="oversized, heavyweight, streetwear"
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
                />
              </div>
            </div>

            {/* Badges / Merchandising Highlights */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Merchandising Badges
              </h3>

              <label className="flex items-center gap-2.5 text-xs font-medium text-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNew || false}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-[#FF6B35] focus:ring-[#FF6B35]"
                />
                <span>Mark as "New Arrival"</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium text-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBestseller || false}
                  onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-[#FF6B35] focus:ring-[#FF6B35]"
                />
                <span>Mark as "Best Seller"</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VARIANTS & MATRIX */}
      {activeTab === 'variants' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
          <VariantMatrix
            productId={formData.id || 'new-product'}
            basePrice={formData.price || 999}
            productSku={formData.sku || 'FF-ITEM'}
            variants={formData.variants || []}
            onChange={(newVariants) => {
              const totalStock = newVariants.reduce((s, v) => s + v.stock, 0);
              setFormData({ ...formData, variants: newVariants, totalStock });
            }}
          />
        </div>
      )}

      {/* TAB 3: IMAGE GALLERY */}
      {activeTab === 'media' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
          <ImageUploader
            images={formData.images || []}
            mainImage={formData.image || ''}
            onChange={(newImages, newMain) => {
              setFormData({ ...formData, images: newImages, image: newMain });
            }}
          />
        </div>
      )}

      {/* TAB 4: SEO & PUBLISHING */}
      {activeTab === 'seo' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Search Engine Optimization (SEO)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Custom URL Handle (Slug)
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 text-xs bg-zinc-100 border border-r-0 border-zinc-200 rounded-l-xl text-zinc-400 select-none">
                  /products/
                </span>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="flex-1 px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-r-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.seoTitle || ''}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                placeholder="Title as it appears on Google..."
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={formData.seoDescription || ''}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                placeholder="High-converting search snippet..."
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
              />
            </div>

            {/* Google SERP Preview Card */}
            <div className="mt-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Google Search Appearance Preview
              </span>
              <p className="text-sm font-medium text-blue-700 truncate">
                {formData.seoTitle || `${formData.name} | Funky Fox`}
              </p>
              <p className="text-[11px] text-emerald-800">
                https://funkyfox.in/products/{formData.slug || 'product-slug'}
              </p>
              <p className="text-xs text-zinc-600 line-clamp-2">
                {formData.seoDescription || formData.description || 'Official Funky Fox apparel catalogue. Premium streetwear with free shipping across India.'}
              </p>
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Publishing Status
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-2">
                Storefront Visibility
              </label>
              <div className="space-y-2">
                {[
                  { id: 'active', label: 'Active & Published', desc: 'Visible to customers immediately' },
                  { id: 'draft', label: 'Draft Mode', desc: 'Hidden from public searches and listings' },
                  { id: 'archived', label: 'Archived', desc: 'Permanently retired from sale' },
                ].map((st) => (
                  <label
                    key={st.id}
                    className={`block p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      formData.status === st.id
                        ? 'border-[#FF6B35] bg-orange-50/40 text-zinc-900 font-semibold'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={st.id}
                      checked={formData.status === st.id}
                      onChange={() => setFormData({ ...formData, status: st.id as any })}
                      className="sr-only"
                    />
                    <div className="font-bold">{st.label}</div>
                    <div className="text-[11px] text-zinc-400 font-normal">{st.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Featured Display Priority
              </label>
              <input
                type="number"
                min="1"
                value={formData.featuredOrder || 1}
                onChange={(e) =>
                  setFormData({ ...formData, featuredOrder: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Lower numbers appear first on homepage and category sorting.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${formData.name}"? This removes the item from the storefront catalogue.`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
}
