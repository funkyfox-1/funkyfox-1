import * as React from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Search,
  Copy,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { MediaItem } from '../lib/types';
import { useAdminToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';

export function MediaLibrary() {
  const { showToast } = useAdminToast();
  const [mediaList, setMediaList] = React.useState<MediaItem[]>([]);
  const [search, setSearch] = React.useState('');
  const [deleteTarget, setDeleteTarget] = React.useState<MediaItem | null>(null);
  const [previewMedia, setPreviewMedia] = React.useState<MediaItem | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadData = () => {
    setMediaList(storeService.getMediaItems());
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('funkyfox:store_updated', loadData);
    return () => window.removeEventListener('funkyfox:store_updated', loadData);
  }, []);

  const filteredMedia = mediaList.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.usedIn.some((u) => u.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('Image URL copied to clipboard', 'success');
  };

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);

    const files = Array.from(e.target.files);
    for (const file of files) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      storeService.addMediaItem({
        name: file.name,
        url: dataUrl,
        size: file.size,
        mimeType: file.type,
        dimensions: { width: 1200, height: 1600 },
        usedIn: ['Media Library Upload'],
      });
    }

    setUploading(false);
    showToast(`Uploaded ${files.length} asset${files.length > 1 ? 's' : ''}`, 'success');
    loadData();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    try {
      storeService.deleteMediaItem(deleteTarget.id);
      showToast(`Deleted ${deleteTarget.name}`, 'info');
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Cannot delete image', 'error');
      setDeleteTarget(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 font-display">
            Central Media Library
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Browse, inspect, upload, and manage high-resolution imagery and campaign photography.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleUploadFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl hover:bg-[#e05624] transition-colors shadow-sm self-start sm:self-auto disabled:opacity-50"
          >
            <UploadCloud size={15} /> {uploading ? 'Processing...' : 'Upload Media'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets by file name or usage reference..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredMedia.length === 0 ? (
        <EmptyState
          icon={<ImageIcon size={28} />}
          title="No media files found"
          description="Upload product photography or banner assets to populate your media store."
          actionLabel="Upload Media Now"
          onAction={() => fileInputRef.current?.click()}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
            >
              <div
                className="relative aspect-square bg-zinc-100 cursor-pointer overflow-hidden"
                onClick={() => setPreviewMedia(item)}
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(item.url);
                    }}
                    className="p-2 rounded-lg bg-white/90 text-zinc-800 hover:bg-white transition-colors"
                    title="Copy URL"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(item);
                    }}
                    className="p-2 rounded-lg bg-white/90 text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-900 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{formatFileSize(item.size)}</p>
                </div>

                <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-500">
                  <span className="truncate max-w-[120px]" title={item.usedIn.join(', ')}>
                    {item.usedIn.length > 0 ? item.usedIn[0] : 'Unassigned'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.url)}
                    className="text-[#FF6B35] font-semibold hover:underline"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Preview Modal */}
      <Modal
        isOpen={Boolean(previewMedia)}
        onClose={() => setPreviewMedia(null)}
        title={previewMedia?.name || 'Image Preview'}
        description="Inspect metadata, dimensions, and active assignments."
        maxWidth="xl"
      >
        {previewMedia && (
          <div className="space-y-4">
            <div className="max-h-96 rounded-xl overflow-hidden bg-zinc-900 flex items-center justify-center p-2">
              <img
                src={previewMedia.url}
                alt={previewMedia.name}
                className="max-h-80 max-w-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <div>
                <span className="text-zinc-400 block text-[11px]">File Size</span>
                <span className="font-semibold text-zinc-800">{formatFileSize(previewMedia.size)}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">MIME Type</span>
                <span className="font-semibold text-zinc-800">{previewMedia.mimeType}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Uploaded</span>
                <span className="font-semibold text-zinc-800">
                  {new Date(previewMedia.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                Active Storefront Assignments:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {previewMedia.usedIn.map((use, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-zinc-100 rounded-lg text-xs font-medium text-zinc-700"
                  >
                    {use}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleCopy(previewMedia.url)}
                className="px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl hover:bg-[#e05624]"
              >
                Copy Public URL
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Media Asset"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? If this image is currently referenced in active products or banners, deletion will be blocked.`}
        confirmLabel="Delete Asset"
        isDestructive={true}
      />
    </div>
  );
}
