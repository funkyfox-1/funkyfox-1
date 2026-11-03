import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Check,
  Sparkles
} from 'lucide-react';
import { getDemoWishlist, toggleDemoWishlist } from '../../data/accountMockData';
import { products, formatPrice, Product } from '../../data/products';
import { showToast } from '../../utils/toast';
import './AccountStyles.css';

interface AccountWishlistProps {
  onAddToCart?: (product: Product, selectedColor?: string, selectedSize?: string) => void;
}

export default function AccountWishlist({ onAddToCart }: AccountWishlistProps) {
  const [wishlistIds, setWishlistIds] = React.useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = React.useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = React.useState<Record<string, string>>({});
  const [addedItems, setAddedItems] = React.useState<Record<string, boolean>>({});
  const [isMovingAll, setIsMovingAll] = React.useState(false);

  const syncWishlist = () => {
    setWishlistIds(getDemoWishlist());
  };

  React.useEffect(() => {
    syncWishlist();
    window.addEventListener('storage', syncWishlist);
    window.addEventListener('funky-fox-wishlist-change', syncWishlist);
    return () => {
      window.removeEventListener('storage', syncWishlist);
      window.removeEventListener('funky-fox-wishlist-change', syncWishlist);
    };
  }, []);

  const wishlistProducts = React.useMemo(() => {
    return products.filter((p) => wishlistIds.includes(p.id));
  }, [wishlistIds]);

  // Curated picks to suggest when wishlist is low or empty
  const suggestedPicks = React.useMemo(() => {
    return products.filter((p) => !wishlistIds.includes(p.id)).slice(0, 3);
  }, [wishlistIds]);

  const handleRemove = (id: string, name: string) => {
    toggleDemoWishlist(id);
    syncWishlist();
    showToast(`${name} removed from your saved fits`, { type: 'info' });
  };

  const handleAdd = (p: Product) => {
    const chosenSize = selectedSizes[p.id] || p.sizes[0] || 'M';
    const chosenColor = selectedColors[p.id] || p.colors[0]?.name || 'Standard';
    if (onAddToCart) {
      onAddToCart(p, chosenColor, chosenSize);
      setAddedItems((prev) => ({ ...prev, [p.id]: true }));
      showToast(`Added ${p.name} (Size ${chosenSize}) to your bag`, { type: 'success' });
      setTimeout(() => {
        setAddedItems((prev) => ({ ...prev, [p.id]: false }));
      }, 2200);
    }
  };

  const handleMoveAllToBag = () => {
    if (!onAddToCart || wishlistProducts.length === 0) return;
    setIsMovingAll(true);
    wishlistProducts.forEach((p) => {
      const chosenSize = selectedSizes[p.id] || p.sizes[0] || 'M';
      const chosenColor = selectedColors[p.id] || p.colors[0]?.name || 'Standard';
      onAddToCart(p, chosenColor, chosenSize);
    });
    showToast(`Moved all ${wishlistProducts.length} saved fits into your bag!`, { type: 'success' });
    setTimeout(() => setIsMovingAll(false), 2000);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all saved fits?')) {
      wishlistProducts.forEach((p) => toggleDemoWishlist(p.id));
      syncWishlist();
      showToast('Saved fits cleared', { type: 'info' });
    }
  };

  const handleAddSuggestion = (p: Product) => {
    toggleDemoWishlist(p.id);
    syncWishlist();
    showToast(`Added ${p.name} to your saved fits!`, { type: 'success' });
  };

  return (
    <div className="space-y-8">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#EDE7D9] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E87535]">
            <Heart size={14} className="fill-[#E87535]" />
            <span>Wardrobe Favorites</span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-black text-[#1c1d1a] tracking-tight mt-1">
            Saved Fits <span className="text-[#78756e] font-normal text-xl sm:text-2xl">({wishlistProducts.length})</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#666259] max-w-xl">
            Pieces you have saved. Pick your preferred size and move directly into your bag.
          </p>
        </div>

        {wishlistProducts.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleMoveAllToBag}
              disabled={isMovingAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c1d1a] hover:bg-[#2b2c27] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs disabled:opacity-50"
            >
              <ShoppingBag size={15} />
              <span>{isMovingAll ? 'Moving to Bag...' : 'Move All to Bag'}</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3.5 py-2.5 rounded-xl border border-[#E0D8C8] bg-white hover:bg-[#F4EFE3] text-[#78756e] hover:text-red-600 text-xs sm:text-sm font-semibold transition-colors"
              title="Clear all saved fits"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: 3 Products Per Row (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3) */}
      {wishlistProducts.length === 0 ? (
        <div className="space-y-10">
          {/* Refined Empty State */}
          <div className="text-center py-14 px-6 border border-dashed border-[#DDD7C8] rounded-3xl bg-[#FAF8F2] max-w-2xl mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F0EAE0] flex items-center justify-center text-[#78756e] mb-4">
              <Heart size={26} strokeWidth={1.75} />
            </div>
            <h3 className="font-sans text-xl font-black text-[#1c1d1a] tracking-tight">
              Your saved fits list is empty
            </h3>
            <p className="text-xs sm:text-sm text-[#78756e] mt-1.5 max-w-md mx-auto leading-relaxed">
              Whenever you spot a shirt, tee, or trouser you like in the catalog, tap the heart icon to save it here for quick access.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1c1d1a] hover:bg-[#2b2c27] text-white text-xs sm:text-sm font-bold tracking-wide transition-colors shadow-xs"
              >
                <span>Browse All Products</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Quick Suggestions to Populate Wishlist */}
          {suggestedPicks.length > 0 && (
            <div className="pt-4 border-t border-[#EDE7D9]">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-[#E87535]" />
                <h4 className="font-sans text-sm font-black uppercase tracking-wider text-[#1c1d1a]">
                  Trending Pieces to Save
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedPicks.map((pick) => (
                  <div
                    key={pick.id}
                    className="group rounded-2xl border border-[#E8E2D5] bg-white p-3.5 flex items-center justify-between gap-4 hover:border-[#1c1d1a]/40 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={pick.image}
                        alt={pick.name}
                        className="w-16 h-20 rounded-xl object-cover bg-[#FAF8F2] shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/products/${pick.id}`}
                          className="font-bold text-xs sm:text-sm text-[#1c1d1a] hover:text-[#E87535] transition-colors truncate block"
                        >
                          {pick.name}
                        </Link>
                        <p className="text-xs font-semibold text-[#78756e] mt-0.5">
                          {formatPrice(pick.price)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddSuggestion(pick)}
                      className="p-2.5 rounded-xl bg-[#FAF6ED] hover:bg-[#E87535] hover:text-white text-[#1c1d1a] transition-all shrink-0"
                      title="Add to saved fits"
                      aria-label="Add to wishlist"
                    >
                      <Heart size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((p) => {
            const currentSize = selectedSizes[p.id] || p.sizes[0] || 'M';
            const currentColor = selectedColors[p.id] || p.colors[0]?.name || 'Standard';
            const isAdded = addedItems[p.id];

            return (
              <div
                key={p.id}
                className="group rounded-2xl sm:rounded-3xl border border-[#EAE4D8] bg-white overflow-hidden flex flex-col justify-between hover:border-[#1c1d1a]/30 transition-all duration-200 shadow-[0_4px_20px_-8px_rgba(28,29,26,0.06)] hover:shadow-[0_8px_28px_-8px_rgba(28,29,26,0.12)]"
              >
                <div>
                  {/* Product Image Frame */}
                  <div className="relative aspect-[4/5] bg-[#FAF8F2] overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = '/images/product-tshirt.webp';
                      }}
                      loading="lazy"
                    />

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider text-[#1c1d1a] shadow-xs border border-[#EAE4D8]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        In Stock
                      </span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="px-2 py-0.5 rounded-full bg-[#E87535] text-white text-[10px] font-bold tracking-wide shadow-xs">
                          {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    {/* Remove Action Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(p.id, p.name)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-[#78756e] hover:text-red-600 shadow-xs backdrop-blur-xs transition-colors"
                      title="Remove from saved fits"
                      aria-label={`Remove ${p.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-3.5">
                    {/* Title & Price */}
                    <div>
                      <Link
                        to={`/products/${p.id}`}
                        className="font-sans text-sm sm:text-[15px] font-bold text-[#1c1d1a] hover:text-[#E87535] transition-colors line-clamp-1"
                      >
                        {p.name}
                      </Link>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-sans text-sm sm:text-base font-black text-[#1c1d1a]">
                          {formatPrice(p.price)}
                        </span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-xs text-[#9E9B93] line-through font-medium">
                            {formatPrice(p.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Color Swatch Dots if multiple */}
                    {p.colors && p.colors.length > 1 && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#78756e]">
                          Color:
                        </span>
                        <div className="flex items-center gap-1.5">
                          {p.colors.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => setSelectedColors((prev) => ({ ...prev, [p.id]: c.name }))}
                              className={`w-4 h-4 rounded-full border transition-all ${
                                currentColor === c.name
                                  ? 'ring-2 ring-[#E87535] ring-offset-1 scale-110'
                                  : 'border-[#D9D4C7] opacity-80 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: c.value }}
                              title={c.name}
                              aria-label={`Select color ${c.name}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size Selector Pills */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#78756e]">
                          Select Fit
                        </span>
                        <span className="text-[11px] font-bold text-[#E87535]">
                          {currentSize}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.sizes.map((s) => {
                          const isSelected = currentSize === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSelectedSizes((prev) => ({ ...prev, [p.id]: s }))}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-[#1c1d1a] text-white shadow-xs'
                                  : 'bg-[#FAF6ED] text-[#1c1d1a] hover:bg-[#F0EAE0] border border-[#EDE7D9]'
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 sm:p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => handleAdd(p)}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-xs ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#1c1d1a] hover:bg-[#2b2c27] text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={16} />
                        <span>Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={15} />
                        <span>Add Size {currentSize} to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
