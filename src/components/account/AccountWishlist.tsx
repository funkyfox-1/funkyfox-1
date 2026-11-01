import * as React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { getDemoWishlist, toggleDemoWishlist } from '../../data/accountMockData';
import { products, formatPrice, Product } from '../../data/products';
import JellyRadio from '../ui/JellyRadio';
import './AccountStyles.css';

interface AccountWishlistProps {
  onAddToCart?: (product: Product, selectedColor?: string, selectedSize?: string) => void;
}

export default function AccountWishlist({ onAddToCart }: AccountWishlistProps) {
  const [wishlistIds, setWishlistIds] = React.useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = React.useState<Record<string, string>>({});
  const [addedItem, setAddedItem] = React.useState<string | null>(null);

  React.useEffect(() => {
    setWishlistIds(getDemoWishlist());
  }, []);

  const wishlistProducts = React.useMemo(() => {
    return products.filter((p) => wishlistIds.includes(p.id));
  }, [wishlistIds]);

  const handleRemove = (id: string) => {
    toggleDemoWishlist(id);
    setWishlistIds(getDemoWishlist());
  };

  const handleAdd = (p: Product) => {
    const chosenSize = selectedSizes[p.id] || p.sizes[0] || 'M';
    const chosenColor = p.colors[0]?.name || 'Standard';
    if (onAddToCart) {
      onAddToCart(p, chosenColor, chosenSize);
      setAddedItem(p.id);
      setTimeout(() => setAddedItem(null), 1800);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0ECE1] pb-5">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-ink">
            Saved Fits ({wishlistProducts.length})
          </h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Garments you are eyeing. Select your size using our dynamic Jelly selector and add directly to your bag.
          </p>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#E8E5DF] rounded-2xl bg-[#FAF9F6] p-8">
          <Heart size={36} className="mx-auto text-neutral-400 mb-3" />
          <h3 className="font-display text-base font-bold uppercase text-ink">Your saved wardrobe is empty</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Browse our everyday collection and tap the heart icon to save your favorite fits for later.
          </p>
          <Link
            to="/products"
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            Explore Collection <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {wishlistProducts.map((p) => {
            const currentSize = selectedSizes[p.id] || p.sizes[0] || 'M';

            return (
              <div
                key={p.id}
                className="rounded-xl border border-[#E8E5DF] bg-white p-4 flex flex-col justify-between hover:border-neutral-400 transition-all shadow-xs"
              >
                <div>
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#FAF9F6] border border-[#E8E5DF]">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/product-tshirt.webp';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(p.id)}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-neutral-600 hover:text-red-600 hover:bg-white shadow-xs transition-colors"
                      title="Remove from saved fits"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="mt-3.5">
                    <Link
                      to={`/products/${p.id}`}
                      className="text-sm font-bold text-ink hover:text-[#E87535] transition-colors block truncate"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs font-bold text-ink mt-0.5">{formatPrice(p.price)}</p>
                  </div>

                  {/* JellyRadio Size Selector */}
                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Choose Fit (Size)
                    </span>
                    <JellyRadio
                      items={p.sizes}
                      value={currentSize}
                      onChange={(val) =>
                        setSelectedSizes((prev) => ({ ...prev, [p.id]: val }))
                      }
                      size="sm"
                      gap={5}
                      radius={8}
                      activeColor="#E87535"
                      chipColor="#FAF9F6"
                      activeTextColor="#ffffff"
                      textColor="#191919"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0ECE1]">
                  <button
                    type="button"
                    onClick={() => handleAdd(p)}
                    className="w-full py-2.5 px-4 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <ShoppingBag size={14} />
                    {addedItem === p.id ? 'Added to Bag ✓' : `Add Size ${currentSize} to Bag`}
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

