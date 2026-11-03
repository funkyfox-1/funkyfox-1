import * as React from 'react';
import { UploadCloud, X, Star, ArrowLeft, ArrowRight, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { storeService } from '../../services/storeService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface ImageUploaderProps {
  images: string[];
  mainImage: string;
  onChange: (images: string[], mainImage: string) => void;
}

export function ImageUploader({ images, mainImage, onChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (files: File[]) => {
    setUploadError(null);
    setUploading(true);

    const validFiles = files.filter((file) => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length < files.length) {
      setUploadError('Some files were ignored. Only JPG, PNG, and WebP under 5MB are accepted.');
    }

    if (validFiles.length === 0) {
      setUploading(false);
      return;
    }

    const uploadedUrls: string[] = [];

    for (const file of validFiles) {
      try {
        if (isSupabaseConfigured && supabase) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

          if (!uploadError) {
            const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
            if (data?.publicUrl) {
              uploadedUrls.push(data.publicUrl);
              storeService.addMediaItem({
                name: file.name,
                url: data.publicUrl,
                size: file.size,
                mimeType: file.type,
                usedIn: ['Product Gallery'],
              });
              continue;
            }
          }
        }

        // Local Data URL Fallback
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        uploadedUrls.push(dataUrl);
        storeService.addMediaItem({
          name: file.name,
          url: dataUrl,
          size: file.size,
          mimeType: file.type,
          usedIn: ['Product Gallery'],
        });
      } catch (err: any) {
        console.error('File processing error:', err);
      }
    }

    const newImages = [...images, ...uploadedUrls];
    const newMain = mainImage && newImages.includes(mainImage) ? mainImage : newImages[0] || '';
    onChange(newImages, newMain);
    setUploading(false);
  };

  const removeImage = (indexToRemove: number) => {
    const targetUrl = images[indexToRemove];
    const newImages = images.filter((_, idx) => idx !== indexToRemove);
    let newMain = mainImage;

    if (mainImage === targetUrl) {
      newMain = newImages[0] || '';
    }
    onChange(newImages, newMain);
  };

  const setAsMain = (url: string) => {
    onChange(images, url);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const updated = [...images];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    onChange(updated, mainImage);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[#FF6B35] bg-orange-50/50'
            : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 mb-3 shadow-sm">
            <UploadCloud size={24} className="text-[#FF6B35]" />
          </div>
          <p className="text-sm font-semibold text-zinc-900">
            Click to upload or drag & drop files
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Supports JPEG, PNG, and WebP (Max 5MB each)
          </p>
          {uploading && (
            <p className="mt-3 text-xs font-semibold text-[#FF6B35] animate-pulse">
              Uploading & processing image assets...
            </p>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle size={15} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Gallery List & Controls */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Product Images ({images.length})
            </span>
            <span className="text-[11px] text-zinc-400">
              Star indicates the primary cover image
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((url, idx) => {
              const isCover = url === mainImage || (!mainImage && idx === 0);
              return (
                <div
                  key={`${url}-${idx}`}
                  className={`group relative rounded-xl overflow-hidden border bg-zinc-100 aspect-[3/4] shadow-sm transition-all ${
                    isCover ? 'ring-2 ring-[#FF6B35] border-transparent' : 'border-zinc-200'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Product preview ${idx + 1}`}
                    className="h-full w-full object-cover object-center"
                  />

                  {/* Badges & Overlay */}
                  {isCover && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#FF6B35] text-white text-[10px] font-bold shadow-sm">
                      Cover
                    </span>
                  )}

                  {/* Action Buttons Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsMain(url);
                        }}
                        title="Set as primary image"
                        className={`p-1.5 rounded-lg text-white transition-colors ${
                          isCover ? 'bg-[#FF6B35]' : 'bg-black/50 hover:bg-[#FF6B35]'
                        }`}
                      >
                        <Star size={13} fill={isCover ? 'white' : 'none'} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                        title="Remove image"
                        className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-rose-600 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex items-center justify-center gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(idx, 'left');
                          }}
                          className="p-1 rounded bg-black/60 text-white hover:bg-zinc-800 transition-colors"
                          title="Move left"
                        >
                          <ArrowLeft size={13} />
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(idx, 'right');
                          }}
                          className="p-1 rounded bg-black/60 text-white hover:bg-zinc-800 transition-colors"
                          title="Move right"
                        >
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
