import * as React from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { ProductVariant } from '../../lib/types';

interface VariantMatrixProps {
  productId: string;
  basePrice: number;
  productSku: string;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const COLOR_PRESETS = [
  { name: 'Ivory', hex: '#E8E3D7' },
  { name: 'Charcoal', hex: '#393B39' },
  { name: 'Olive', hex: '#777D63' },
  { name: 'Navy', hex: '#1E293B' },
  { name: 'Black', hex: '#171717' },
  { name: 'Sand', hex: '#D6C7B2' },
  { name: 'Rust', hex: '#B45309' },
  { name: 'White', hex: '#FFFFFF' },
];

export function VariantMatrix({
  productId,
  basePrice,
  productSku,
  variants,
  onChange,
}: VariantMatrixProps) {
  const [selectedSizes, setSelectedSizes] = React.useState<string[]>(
    variants.length > 0 ? Array.from(new Set(variants.map((v) => v.size))) : ['S', 'M', 'L', 'XL']
  );

  const [colors, setColors] = React.useState<Array<{ name: string; hex: string }>>(
    variants.length > 0
      ? Array.from(
          new Map(variants.map((v) => [v.colorName, { name: v.colorName, hex: v.colorHex }])).values()
        )
      : [{ name: 'Black', hex: '#171717' }]
  );

  const [newColorName, setNewColorName] = React.useState('');
  const [newColorHex, setNewColorHex] = React.useState('#000000');

  const toggleSize = (size: string) => {
    let next: string[];
    if (selectedSizes.includes(size)) {
      next = selectedSizes.filter((s) => s !== size);
    } else {
      next = [...selectedSizes, size];
    }
    setSelectedSizes(next);
    regenerateMatrix(next, colors);
  };

  const addColor = (col: { name: string; hex: string }) => {
    if (colors.some((c) => c.name.toLowerCase() === col.name.toLowerCase())) return;
    const next = [...colors, col];
    setColors(next);
    regenerateMatrix(selectedSizes, next);
  };

  const removeColor = (colorName: string) => {
    const next = colors.filter((c) => c.name !== colorName);
    setColors(next);
    regenerateMatrix(selectedSizes, next);
  };

  const regenerateMatrix = (sizesList: string[], colorsList: Array<{ name: string; hex: string }>) => {
    const newVariants: ProductVariant[] = [];

    colorsList.forEach((col) => {
      sizesList.forEach((sz) => {
        const existing = variants.find((v) => v.colorName === col.name && v.size === sz);
        if (existing) {
          newVariants.push({ ...existing, colorHex: col.hex });
        } else {
          const skuSuffix = `${col.name.slice(0, 2).toUpperCase()}-${sz}`;
          newVariants.push({
            id: `${productId || 'prod'}-${col.name.toLowerCase().replace(/\s+/g, '-')}-${sz.toLowerCase()}`,
            productId: productId || 'prod',
            size: sz,
            colorName: col.name,
            colorHex: col.hex,
            sku: `${productSku || 'FF'}-${skuSuffix}`,
            stock: 10,
            price: basePrice,
            inStock: true,
          });
        }
      });
    });

    onChange(newVariants);
  };

  const updateVariant = (index: number, updates: Partial<ProductVariant>) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Sizes Selection */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
          1. Select Available Sizes
        </label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_SIZES.map((sz) => {
            const isSelected = selectedSizes.includes(sz);
            return (
              <button
                type="button"
                key={sz}
                onClick={() => toggleSize(sz)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-[#171717] text-white border-[#171717] shadow-sm'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors Selection */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
          2. Select & Add Colours
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {COLOR_PRESETS.map((preset) => {
            const isAdded = colors.some((c) => c.name.toLowerCase() === preset.name.toLowerCase());
            return (
              <button
                type="button"
                key={preset.name}
                onClick={() => (isAdded ? removeColor(preset.name) : addColor(preset))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isAdded
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full border border-black/20"
                  style={{ backgroundColor: preset.hex }}
                />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Color Input */}
        <div className="flex items-center gap-2 max-w-sm">
          <input
            type="color"
            value={newColorHex}
            onChange={(e) => setNewColorHex(e.target.value)}
            className="h-9 w-9 rounded-lg border border-zinc-200 p-0.5 cursor-pointer bg-white"
          />
          <input
            type="text"
            placeholder="Custom colour name (e.g. Sage Green)"
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
          />
          <button
            type="button"
            onClick={() => {
              if (newColorName.trim()) {
                addColor({ name: newColorName.trim(), hex: newColorHex });
                setNewColorName('');
              }
            }}
            className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Generated Matrix Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            3. Variant Inventory & Pricing Matrix ({variants.length} combinations)
          </label>
          <button
            type="button"
            onClick={() => regenerateMatrix(selectedSizes, colors)}
            className="text-xs font-semibold text-[#FF6B35] hover:underline flex items-center gap-1"
          >
            <RefreshCw size={12} /> Regenerate Matrix
          </button>
        </div>

        {variants.length === 0 ? (
          <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl text-center text-xs text-zinc-400">
            Select at least one size and one colour above to generate variant matrix.
          </div>
        ) : (
          <div className="border border-zinc-200 rounded-xl overflow-x-auto bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Variant</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Stock Qty</th>
                  <th className="py-2.5 px-3">Price (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {variants.map((v, idx) => (
                  <tr key={v.id || idx} className="hover:bg-zinc-50/50">
                    <td className="py-2.5 px-3 font-medium text-zinc-900">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: v.colorHex }}
                        />
                        <span>{v.colorName}</span>
                        <span className="text-zinc-400">/</span>
                        <span className="font-bold text-zinc-700">{v.size}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => updateVariant(idx, { sku: e.target.value })}
                        className="w-36 px-2 py-1 text-xs border border-zinc-200 rounded font-mono text-zinc-800 focus:outline-none focus:border-[#FF6B35]"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) =>
                          updateVariant(idx, {
                            stock: parseInt(e.target.value) || 0,
                            inStock: (parseInt(e.target.value) || 0) > 0,
                          })
                        }
                        className="w-20 px-2 py-1 text-xs border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-[#FF6B35]"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        value={v.price ?? basePrice}
                        onChange={(e) =>
                          updateVariant(idx, { price: parseFloat(e.target.value) || basePrice })
                        }
                        className="w-24 px-2 py-1 text-xs border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-[#FF6B35]"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => updateVariant(idx, { inStock: !v.inStock })}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                          v.inStock && v.stock > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {v.inStock && v.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </button>
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
