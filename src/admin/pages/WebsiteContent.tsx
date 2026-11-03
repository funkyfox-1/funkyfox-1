import * as React from 'react';
import { LayoutTemplate, Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { storeService } from '../services/storeService';
import { HomepageBanner } from '../lib/types';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAdminToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';

export function WebsiteContent() {
  const { showToast } = useAdminToast();
  const [banners, setBanners] = React.useState<HomepageBanner[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingBanner, setEditingBanner] = React.useState<HomepageBanner | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<HomepageBanner | null>(null);

  // Form State
  const [title, setTitle] = React.useState('');
  const [subtitle, setSubtitle] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [mobileImageUrl, setMobileImageUrl] = React.useState('');
  const [ctaText, setCtaText] = React.useState('');
  const [ctaLink, setCtaLink] = React.useState('');
  const [badge, setBadge] = React.useState('');
  const [position, setPosition] = React.useState<'hero' | 'middle' | 'strip'>('hero');
  const [order, setOrder] = React.useState(1);
  const [isActive, setIsActive] = React.useState(true);

  const loadData = () => {
    setBanners(storeService.getBanners());
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('funkyfox:store_updated', loadData);
    return () => window.removeEventListener('funkyfox:store_updated', loadData);
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('/images/editorial-campaign.webp');
    setMobileImageUrl('/images/editorial-campaign-small.webp');
    setCtaText('Explore Collection');
    setCtaLink('/products');
    setBadge('New Drop');
    setPosition('hero');
    setOrder(banners.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (ban: HomepageBanner) => {
    setEditingBanner(ban);
    setTitle(ban.title);
    setSubtitle(ban.subtitle || '');
    setImageUrl(ban.imageUrl);
    setMobileImageUrl(ban.mobileImageUrl || '');
    setCtaText(ban.ctaText);
    setCtaLink(ban.ctaLink);
    setBadge(ban.badge || '');
    setPosition(ban.position);
    setOrder(ban.order);
    setIsActive(ban.isActive);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      showToast('Banner title and image are mandatory', 'error');
      return;
    }

    const banId = editingBanner ? editingBanner.id : `ban-${Date.now()}`;
    const updated: HomepageBanner = {
      id: banId,
      title: title.trim(),
      subtitle,
      imageUrl,
      mobileImageUrl,
      ctaText,
      ctaLink,
      badge,
      position,
      order: Number(order),
      isActive,
    };

    storeService.saveBanner(updated);
    showToast(`Banner "${updated.title}" saved`, 'success');
    setModalOpen(false);
    loadData();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    storeService.deleteBanner(deleteTarget.id);
    showToast(`Deleted banner "${deleteTarget.title}"`, 'info');
    setDeleteTarget(null);
    loadData();
  };

  const toggleActive = (ban: HomepageBanner) => {
    storeService.saveBanner({ ...ban, isActive: !ban.isActive });
    showToast(`Banner status updated`, 'success');
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 font-display">
            Homepage & Editorial Content
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Control promotional hero banners, campaign imagery, call-to-actions, and editorial drop showcases.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl hover:bg-[#e05624] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={15} /> Add Banner
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
          >
            {/* Banner Preview */}
            <div className="relative aspect-[16/9] bg-zinc-900 overflow-hidden">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-white">
                {banner.badge && (
                  <span className="w-fit px-2 py-0.5 rounded-full bg-[#FF6B35] text-[10px] font-bold uppercase tracking-wider mb-2">
                    {banner.badge}
                  </span>
                )}
                <h3 className="font-display font-black text-lg uppercase tracking-tight">{banner.title}</h3>
                {banner.subtitle && <p className="text-xs text-zinc-300 mt-1 line-clamp-1">{banner.subtitle}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-3 py-1 bg-white text-zinc-900 text-xs font-bold uppercase tracking-wider rounded-lg">
                    {banner.ctaText} →
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">{banner.ctaLink}</span>
                </div>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-2">
                <Badge variant={banner.isActive ? 'success' : 'neutral'}>
                  {banner.isActive ? 'Published' : 'Hidden'}
                </Badge>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-4 flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-700 uppercase tracking-wider text-[11px]">
                  Position: {banner.position}
                </span>
                <span>·</span>
                <span>Order: {banner.order}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleActive(banner)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                  title={banner.isActive ? 'Hide from storefront' : 'Publish to storefront'}
                >
                  {banner.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(banner)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                  title="Edit banner"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(banner)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete banner"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBanner ? 'Edit Banner Showcase' : 'Create Homepage Banner'}
        description="Configure banner imagery, headline typography, and destination links."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Banner Heading <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer 2026 Editorial Drop"
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Heavyweight organic cottons, relaxed tailoring, and daily silhouettes."
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Desktop Image URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/images/editorial-campaign.webp"
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Mobile Image URL (Optional)
            </label>
            <input
              type="text"
              value={mobileImageUrl}
              onChange={(e) => setMobileImageUrl(e.target.value)}
              placeholder="/images/editorial-campaign-small.webp"
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Shop Now"
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                CTA Target Link
              </label>
              <input
                type="text"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                placeholder="/products?sort=newest"
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Badge Pill
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="New Season"
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl"
              >
                <option value="hero">Hero Top</option>
                <option value="middle">Middle Editorial</option>
                <option value="strip">Announcement Strip</option>
              </select>
            </div>

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
              Save Banner
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Homepage Banner"
        message={`Are you sure you want to delete banner "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
}
