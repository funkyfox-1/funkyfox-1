import * as React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles, Check, Heart } from 'lucide-react'
import { formatPrice } from '../data/products'
import { showToast } from '../utils/toast'
import { isInDemoWishlist, toggleDemoWishlist } from '../data/accountMockData'

export interface EthnicProduct {
  id: string
  name: string
  subtitle: string
  price: number
  originalPrice: number
  image: string
  badge?: string
  fabric: string
  colors: { name: string; hex: string }[]
  sizes: ('S' | 'M' | 'L' | 'XL' | 'XXL')[]
  description: string
}

export const ETHNIC_PRODUCTS: EthnicProduct[] = [
  {
    id: 'modern-bandhgala-kurta',
    name: 'Terracotta Raw Silk Bandhgala Kurta',
    subtitle: 'Mandarin collar · Tailored comfort fit',
    price: 1899,
    originalPrice: 2499,
    image: '/images/products/ethnic-bandhgala-rust.webp',
    badge: 'NEW DROP',
    fabric: 'Raw Silk & Slub Cotton Blend',
    colors: [
      { name: 'Terracotta Rust', hex: '#C25E34' },
      { name: 'Sand Cream', hex: '#EDE3D1' },
      { name: 'Charcoal Black', hex: '#232321' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'A contemporary take on traditional festive wear. Tailored with clean lines, structured mandarin collar and breathable slub blend for all-day weddings and festivals.',
  },
  {
    id: 'sandstone-nehru-jacket',
    name: 'Textured Nehru Waistcoat & Kurta',
    subtitle: 'Champagne gold accents · Classic regal cut',
    price: 2299,
    originalPrice: 2999,
    image: '/images/products/ethnic-nehru-jacket.webp',
    badge: 'LIMITED EDITION',
    fabric: 'Textured Jacquard & Pure Linen',
    colors: [
      { name: 'Champagne Sand', hex: '#D8C7A5' },
      { name: 'Ivory Bone', hex: '#F5F2EA' },
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    description: 'Artisanal woven Nehru jacket layered over an ivory base. Designed for sangeets, poojas, and celebratory evening dinners.',
  },
  {
    id: 'sage-olive-linen-kurta',
    name: 'Minimalist Sage Linen Kurta Shirt',
    subtitle: 'Roll-tab sleeves · Mother-of-pearl buttons',
    price: 1499,
    originalPrice: 1999,
    image: '/images/products/ethnic-linen-kurta.webp',
    badge: 'BESTSELLER',
    fabric: '100% Breathable Organic Linen',
    colors: [
      { name: 'Sage Olive', hex: '#7A846E' },
      { name: 'Warm Terracotta', hex: '#B86542' },
      { name: 'Natural Sand', hex: '#E2DAC8' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Effortless fusion of casual shirt and festive kurta. Roll the sleeves up for weekend gatherings or pair with trousers for cultural occasions.',
  },
  {
    id: 'midnight-asymmetric-kurta',
    name: 'Midnight Asymmetric Festive Kurta',
    subtitle: 'Deep navy drape · Modern angled placket',
    price: 1999,
    originalPrice: 2699,
    image: '/images/products/ethnic-asymmetric-kurta.webp',
    badge: 'EXCLUSIVE',
    fabric: 'Fine Viscose Silk Blend',
    colors: [
      { name: 'Midnight Navy', hex: '#1E2838' },
      { name: 'Deep Wine', hex: '#4A1D2B' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Dramatic architectural drape meeting heritage Indian silhouette. Features metallic horn buttons and an angled diagonal placket.',
  },
]

interface EthnicWearSectionProps {
  onAddToCart?: (product: any, color: string, size: string, qty: number) => void
}

export default function EthnicWearSection({ onAddToCart }: EthnicWearSectionProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [selectedSizes, setSelectedSizes] = React.useState<Record<string, string>>({
    'modern-bandhgala-kurta': 'L',
    'sandstone-nehru-jacket': 'L',
    'sage-olive-linen-kurta': 'M',
    'midnight-asymmetric-kurta': 'L',
  })
  const [selectedColors, setSelectedColors] = React.useState<Record<string, string>>({
    'modern-bandhgala-kurta': 'Terracotta Rust',
    'sandstone-nehru-jacket': 'Champagne Sand',
    'sage-olive-linen-kurta': 'Sage Olive',
    'midnight-asymmetric-kurta': 'Midnight Navy',
  })
  const [addedAnimation, setAddedAnimation] = React.useState<Record<string, boolean>>({})

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -340 : 340
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const handleAdd = (item: EthnicProduct) => {
    const size = selectedSizes[item.id] || item.sizes[0]
    const color = selectedColors[item.id] || item.colors[0].name

    if (onAddToCart) {
      onAddToCart(
        {
          id: item.id,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image,
          category: 'Shirts',
          colors: item.colors.map(c => ({ name: c.name, value: c.hex })),
          sizes: item.sizes,
          inStock: true,
        },
        color,
        size,
        1
      )
    }

    setAddedAnimation(prev => ({ ...prev, [item.id]: true }))
    showToast(`Added ${item.name} (${size}) to your bag`, { type: 'success' })

    setTimeout(() => {
      setAddedAnimation(prev => ({ ...prev, [item.id]: false }))
    }, 1500)
  }

  return (
    <section
      id="ethnic-wear"
      className="scroll-mt-20 border-t border-line bg-[#FAF8F2] py-14 sm:py-20 lg:py-24"
      aria-labelledby="ethnic-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with Editorial Flair */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.22em] text-[#E87535]">
              <Sparkles size={14} />
              <span>THE FESTIVE &amp; ETHNIC EDIT</span>
            </div>
            <h2
              id="ethnic-heading"
              className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-ink"
            >
              Modern Heritage. <span className="text-[#E87535]">Everyday Royalty.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-soft max-w-xl font-normal leading-relaxed">
              Breathable raw silks, handloom linen blends, and structured bandhgalas cut for contemporary silhouettes and celebratory evenings.
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-fox hover:text-fox active:scale-95 shadow-xs"
              aria-label="Previous ethnic product"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-fox hover:text-fox active:scale-95 shadow-xs"
              aria-label="Next ethnic product"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="flex gap-5 sm:gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {ETHNIC_PRODUCTS.map((product) => {
            const currentSize = selectedSizes[product.id] || product.sizes[0]
            const currentColor = selectedColors[product.id] || product.colors[0].name
            const isAdded = addedAnimation[product.id]
            const inWishlist = isInDemoWishlist(product.id)

            return (
              <div
                key={product.id}
                className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-start flex flex-col justify-between rounded-2xl border border-[#E9E4D8] bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#1c1d1a]"
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#F0ECE1]">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback placeholder if asset still generating
                        e.currentTarget.src = '/images/hero-model.jpg'
                      }}
                    />

                    {/* Badge */}
                    {product.badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-[#1c1d1a] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                        {product.badge}
                      </span>
                    )}

                    {/* Wishlist toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleDemoWishlist(product.id)
                        showToast(inWishlist ? 'Removed from saved fits' : 'Saved to your fits', { type: 'info' })
                      }}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur-xs transition-colors hover:text-fox"
                      aria-label="Save to wishlist"
                    >
                      <Heart
                        size={16}
                        className={inWishlist ? 'fill-fox text-fox' : 'text-ink'}
                      />
                    </button>
                  </div>

                  {/* Title and Pricing */}
                  <div className="mt-4">
                    <h3 className="font-display text-base font-extrabold uppercase tracking-tight text-ink">
                      {product.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-soft font-medium">
                      {product.subtitle}
                    </p>

                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="font-display text-lg font-black text-ink">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-neutral-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                      <span className="text-[11px] font-bold uppercase tracking-wider text-green-700">
                        Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    </div>

                    {/* Color Swatches */}
                    <div className="mt-3 flex items-center gap-1.5" aria-label="Available colors">
                      {product.colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColors(prev => ({ ...prev, [product.id]: c.name }))}
                          className={`h-4.5 w-4.5 rounded-full border transition-all ${
                            currentColor === c.name ? 'border-[#E87535] ring-2 ring-[#E87535]/30 scale-110' : 'border-black/20'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                          aria-label={c.name}
                        />
                      ))}
                      <span className="ml-1 text-[11px] text-neutral-500 font-medium truncate max-w-[150px]">
                        {currentColor}
                      </span>
                    </div>

                    {/* Size Selector Pills */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-soft tracking-wider mr-1">Size:</span>
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSizes(prev => ({ ...prev, [product.id]: sz }))}
                          className={`min-w-[28px] h-7 px-1.5 rounded-md text-[11px] font-bold uppercase transition-colors ${
                            currentSize === sz
                              ? 'bg-ink text-white shadow-xs'
                              : 'bg-[#F2EFE8] text-ink hover:bg-[#E5E0D5]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add To Bag CTA */}
                <div className="mt-5 pt-3 border-t border-[#F2ECE1]">
                  <button
                    type="button"
                    onClick={() => handleAdd(product)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-98 ${
                      isAdded
                        ? 'bg-green-700 text-white'
                        : 'bg-[#E87535] hover:bg-[#cf5f22] text-white shadow-xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={14} />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} />
                        <span>Add to Bag · {currentSize}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

