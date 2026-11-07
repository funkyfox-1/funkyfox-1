import * as React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Ruler,
  AlertCircle,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Zap,
  Flame,
  Heart,
} from 'lucide-react'
import { products, formatPrice, getCategoryFallbackImage, ALL_SIZES, type Product } from '../data/products'
import { storeService } from '../admin/services/storeService'
import { isDemoLoggedIn, isInDemoWishlist, toggleDemoWishlist } from '../data/accountMockData'
import { showToast } from '../utils/toast'
import { PROVISIONAL_SHIPPING_POLICY } from '../config/shipping'
import { DeliveryService, PincodeDeliveryResult } from '../services/api'
import { ErrorState } from './feedback'
import Footer from './Footer'
import JellyRadio from './ui/JellyRadio'
import { SEOHead } from './seo/SEOHead'
import { analyticsService } from '../services/analyticsService'
import './ui/TactileOrderButton.css'
import './ProductDetailPage.css'

interface ProductDetailPageProps {
  addToCart: (product: Product, color?: string, size?: string, quantity?: number) => void
}

export default function ProductDetailPage({ addToCart }: ProductDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [storeTick, setStoreTick] = React.useState<number>(0)

  // Live Storefront Synchronization with Admin Store
  React.useEffect(() => {
    const handleSync = () => setStoreTick((t) => t + 1)
    window.addEventListener('funkyfox:store_updated', handleSync)
    return () => window.removeEventListener('funkyfox:store_updated', handleSync)
  }, [])

  // Find product by id (authoritative from storeService with fallback to products)
  const product: Product | undefined = React.useMemo(() => {
    try {
      const sp = storeService.getProductById(id || '');
      if (sp) {
        return {
          id: sp.id,
          name: sp.name,
          price: sp.price,
          originalPrice: sp.originalPrice,
          image: sp.image,
          images: sp.images && sp.images.length > 0 ? sp.images : [sp.image],
          alt: sp.alt || sp.name,
          category: sp.category as any,
          colors:
            sp.variants && sp.variants.length > 0
              ? Array.from(
                  new Map(
                    sp.variants.map((v) => [v.colorName, { name: v.colorName, value: v.colorHex }])
                  ).values()
                )
              : [{ name: 'Standard', value: '#171717' }],
          sizes:
            sp.variants && sp.variants.length > 0
              ? (Array.from(new Set(sp.variants.map((v) => v.size))) as any)
              : (['S', 'M', 'L', 'XL'] as any),
          inStock: sp.totalStock > 0 && sp.status === 'active',
          isNew: sp.isNew,
          isBestseller: sp.isBestseller,
          featuredOrder: sp.featuredOrder || 99,
          description: sp.description,
          details: sp.details,
          fitFabric: (sp as any).fitFabric || (products.find((p) => p.id === id || (p as any).slug === id) as any)?.fitFabric,
        };
      }
    } catch {}
    return products.find((p) => p.id === id || (p as any).slug === id);
  }, [id, storeTick]);

  // Gallery state
  const images = React.useMemo(() => {
    if (!product) return []
    if (product.images && product.images.length > 0) {
      return product.images
    }
    return [product.image]
  }, [product])

  const [activeImageIndex, setActiveImageIndex] = React.useState<number>(0)

  // Selection states
  const [selectedColor, setSelectedColor] = React.useState<string>(
    product?.colors[0]?.name || ''
  )

  // Variant availability checking
  const isSizeAvailable = React.useCallback(
    (size: string) => {
      if (!product || !product.sizes.includes(size as any)) return false;
      try {
        const ap = storeService.getProductById(product.id);
        if (ap && ap.variants && ap.variants.length > 0) {
          const normCol = (selectedColor || '').toLowerCase().trim();
          const variant = ap.variants.find(
            (v) =>
              v.size.toLowerCase().trim() === size.toLowerCase().trim() &&
              (!normCol || v.colorName.toLowerCase().trim() === normCol)
          );
          if (variant) {
            return variant.stock > 0 && variant.inStock !== false;
          }
        }
      } catch {}
      return product.inStock;
    },
    [product, selectedColor, storeTick]
  );
  const [selectedSize, setSelectedSize] = React.useState<string>('')
  const [quantity, setQuantity] = React.useState<number>(1)
  const [sizeError, setSizeError] = React.useState<string>('')
  const [showStickyBar, setShowStickyBar] = React.useState<boolean>(false)

  // Ref to monitor scroll past main purchase controls
  const mainBuyRef = React.useRef<HTMLDivElement>(null)

  // Accordion open states
  const [openAccordions, setOpenAccordions] = React.useState<Record<string, boolean>>({
    details: true,
    fitFabric: false,
    shipping: false,
    returns: false,
  })

  // Size Guide modal
  const [isSizeGuideOpen, setIsSizeGuideOpen] = React.useState<boolean>(false)

  // Pincode delivery estimator state (default customer address Vijayawada hub: 520010)
  const [pincode, setPincode] = React.useState('520010')
  const [pincodeResult, setPincodeResult] = React.useState<PincodeDeliveryResult | null>(null)
  const [pincodeLoading, setPincodeLoading] = React.useState(false)
  const [pincodeError, setPincodeError] = React.useState('')

  const handleCheckPincode = async (codeToCheck?: string) => {
    const code = codeToCheck || pincode
    setPincodeError('')
    setPincodeLoading(true)
    try {
      const res = await DeliveryService.checkPincode(code)
      setPincodeResult(res)
    } catch (err: any) {
      setPincodeError(err.message || 'Unable to check delivery time for this PIN code.')
      setPincodeResult(null)
    } finally {
      setPincodeLoading(false)
    }
  }

  // Initial check on mount
  React.useEffect(() => {
    handleCheckPincode('520010')
  }, [])

  // Related products color selection states
  const [relatedProductColors, setRelatedProductColors] = React.useState<Record<string, string>>({})

  // Track product view (GA4 view_item & Meta ViewContent)
  React.useEffect(() => {
    if (product) {
      analyticsService.trackViewItem({
        id: product.id,
        name: product.name,
        category: product.category,
        price: Number(product.price),
        sku: (product as any).sku || product.id,
      });
    }
  }, [product?.id]);

  // Reset selections when product id changes
  React.useEffect(() => {
    if (product) {
      setActiveImageIndex(0)
      setSelectedColor(product.colors[0]?.name || '')
      setSelectedSize('')
      setQuantity(1)
      setSizeError('')
      window.scrollTo(0, 0)
    }
  }, [id, product])

  // IntersectionObserver to show sticky purchase bar when main purchase controls scroll out of viewport (past top)
  React.useEffect(() => {
    const el = mainBuyRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Sticky bar appears only after the user scrolls down past the main purchase block
        const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0
        setShowStickyBar(scrolledPast)
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '0px',
      }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
    }
  }, [product])

  // Toggle Accordion
  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Wishlist state for current product
  const [isWishlisted, setIsWishlisted] = React.useState(() => {
    return product ? isInDemoWishlist(product.id) : false;
  });

  React.useEffect(() => {
    const syncWishlist = () => {
      if (product) setIsWishlisted(isInDemoWishlist(product.id));
    };
    window.addEventListener('funky-fox-wishlist-change', syncWishlist);
    return () => window.removeEventListener('funky-fox-wishlist-change', syncWishlist);
  }, [product]);

  const handleToggleWishlist = () => {
    if (!product) return;
    if (!isDemoLoggedIn()) {
      showToast('Please create an account or sign in to save items to your wishlist.', { type: 'info' });
      navigate('/login', {
        state: {
          from: `/products/${product.id}`,
          reason: 'Please create an account or sign in to save items to your wishlist.'
        }
      });
      return;
    }
    const added = toggleDemoWishlist(product.id);
    setIsWishlisted(added);
    showToast(added ? `Saved ${product.name} to your Wishlist` : `Removed ${product.name} from Wishlist`, {
      type: added ? 'success' : 'info'
    });
  };

  // Handle Add to Bag with size validation and auth guard
  const handleAddToCart = () => {
    if (!product) return

    // Auth Guard: must be logged in before adding to bag
    if (!isDemoLoggedIn()) {
      showToast('Please create an account or sign in to add items to your bag.', { type: 'info' });
      navigate('/login', {
        state: {
          from: `/products/${product.id}`,
          pendingAdd: {
            product,
            color: selectedColor,
            size: selectedSize || product.sizes[0],
            qty: quantity
          },
          reason: 'Please create an account or sign in to add items to your bag.'
        }
      });
      return;
    }

    // Size validation
    if (!selectedSize) {
      setSizeError('Please choose a size before adding to bag.')
      // Scroll to size selector if needed
      const sizeElement = document.getElementById('size-selector-area')
      if (sizeElement) {
        sizeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    // Availability validation
    if (!isSizeAvailable(selectedSize)) {
      setSizeError(`Size ${selectedSize} is currently out of stock. Please select another size.`)
      return
    }

    setSizeError('')
    addToCart(product, selectedColor, selectedSize, quantity)
  }

  // Handle size selection
  const handleSelectSize = (size: string) => {
    setSelectedSize(size)
    if (sizeError) setSizeError('')
  }

  // Gallery navigation
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // 1. Similar Products (matching category, excluding current product, 4 items)
  const similarProducts = React.useMemo(() => {
    if (!product) return []
    const sameCategory = products.filter(
      (p) => p.category === product.category && p.id !== product.id
    )
    const fallback = products.filter((p) => p.id !== product.id)
    return (sameCategory.length >= 4 ? sameCategory : [...sameCategory, ...fallback]).slice(0, 4)
  }, [product])

  // 2. Trending Now (top bestsellers & new arrivals, 4 items)
  const trendingProducts = React.useMemo(() => {
    if (!product) return []
    const trending = products.filter(
      (p) => p.id !== product.id && (p.isBestseller || p.isNew)
    )
    const fallback = products.filter((p) => p.id !== product.id)
    return (trending.length >= 4 ? trending : [...trending, ...fallback]).slice(0, 4)
  }, [product])

  // 3. Complete The Look (complementary cross-category layering, 4 items)
  const completeLookProducts = React.useMemo(() => {
    if (!product) return []
    const crossCategory = products.filter(
      (p) => p.category !== product.category && p.id !== product.id
    )
    const fallback = products.filter((p) => p.id !== product.id)
    return (crossCategory.length >= 4 ? crossCategory : [...crossCategory, ...fallback]).slice(0, 4)
  }, [product])

  const [recProductColors, setRecProductColors] = React.useState<Record<string, string>>({})

  // 404 Product Not Found State
  if (!product) {
    return (
      <div className="pdp-page flex flex-col justify-between min-h-screen">
        <div className="pdp-container py-16 flex-1 flex flex-col items-center justify-center">
          <ErrorState
            heading="PIECE NOT FOUND"
            headingLevel="h1"
            message="The clothing piece you are looking for does not exist or has been moved from the catalogue."
            isTemporary={false}
            action={{
              label: 'RETURN TO SHOP',
              to: '/products',
            }}
            secondaryAction={{
              label: 'HOMEPAGE',
              to: '/',
            }}
          />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="pdp-page pb-24 sm:pb-28">
      {/* Dynamic SEO Meta & Product Schema JSON-LD */}
      <SEOHead
        title={`${product.name} | Funky Fox`}
        description={product.description || `${product.name} - Everyday menswear essentials by Funky Fox India.`}
        canonicalUrl={`https://funkyfox.in/products/${(product as any).slug || product.id}`}
        ogImage={product.image}
        ogType="product"
        product={{
          name: product.name,
          description: product.description,
          image: product.image,
          price: Number(product.price),
          sku: (product as any).sku || product.id,
          inStock: product.inStock,
          category: product.category,
          url: `https://funkyfox.in/products/${(product as any).slug || product.id}`,
        }}
      />
      <div className="pdp-container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="pt-6 sm:pt-8 text-xs font-medium text-soft">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link to="/#home" className="hover:text-fox transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/products" className="hover:text-fox transition-colors">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="hover:text-fox transition-colors"
              >
                {product.category}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink font-semibold truncate max-w-[200px] sm:max-w-none" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* 1. PAGE LAYOUT: Two Column Composition */}
        <div className="pdp-layout">
          {/* LEFT: 2. PRODUCT IMAGE GALLERY (~58% desktop width) */}
          <div className="pdp-gallery">
            <div className="pdp-main-image-wrap rounded-sm shadow-sm">
              <img
                src={images[activeImageIndex]}
                alt={`${product.name} — view ${activeImageIndex + 1}`}
                className="pdp-main-image"
                width="1024"
                height="1536"
                fetchPriority="high"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = getCategoryFallbackImage(product.category)
                }}
              />

              {/* Stock Status Badge */}
              {!product.inStock && (
                <span className="absolute top-4 left-4 bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-paper shadow">
                  Sold Out
                </span>
              )}

              {/* Prev / Next buttons for mobile and quick switching */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    aria-label="Previous product image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-ink shadow backdrop-blur transition-all hover:bg-white hover:scale-105 sm:hidden"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Next product image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-ink shadow backdrop-blur transition-all hover:bg-white hover:scale-105 sm:hidden"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation (Desktop & Tablet) */}
            {images.length > 1 && (
              <div className="hidden sm:flex pdp-thumbnails" aria-label="Product thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`Switch to image view ${idx + 1}`}
                    aria-current={activeImageIndex === idx ? 'true' : undefined}
                    className={`pdp-thumb-btn ${
                      activeImageIndex === idx ? 'pdp-thumb-btn--active' : ''
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="pdp-thumb-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = getCategoryFallbackImage(product.category)
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Mobile Indicators */}
            {images.length > 1 && (
              <div className="flex sm:hidden pdp-indicators" aria-label="Image slide indicator">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`Jump to image ${idx + 1}`}
                    className={`pdp-dot ${
                      activeImageIndex === idx ? 'pdp-dot--active' : ''
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: 3. PRODUCT INFORMATION & PURCHASE CONTROLS */}
          <div className="flex flex-col">
            {/* Category Eyebrow */}
            <p className="flex items-center gap-2.5 text-[10.5px] font-bold uppercase tracking-[.28em] text-soft">
              <span aria-hidden="true" className="h-[3px] w-6 rounded-full bg-fox" />
              {product.category}
            </p>

            {/* Product Title */}
            <h1 className="mt-3 font-display text-2xl font-black uppercase leading-[1.05] tracking-[-0.03em] text-ink sm:text-3xl lg:text-[2.25rem]">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-3.5 flex items-baseline gap-3 flex-wrap">
              <span className="font-display text-xl font-extrabold text-ink sm:text-2xl">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-sm font-normal text-soft line-through sm:text-base">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-fox">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                  </span>
                </>
              )}
              <span className="text-xs text-soft">Inclusive of all taxes</span>
            </div>

            {/* Short Product Description */}
            <p className="mt-4 text-sm leading-relaxed text-soft">
              {product.description ||
                'An everyday essential with a relaxed fit and an easy-to-style silhouette.'}
            </p>

            {/* Free shipping banner */}
            <div className="mt-5 flex items-center gap-2.5 rounded border border-line bg-sand/40 px-3.5 py-2.5 text-xs font-medium text-ink">
              <Truck size={16} className="text-fox shrink-0" />
              <span>
                {`Free shipping on orders above ₹${PROVISIONAL_SHIPPING_POLICY.freeShippingThreshold.toLocaleString('en-IN')}. Easy 15-day returns.`}
              </span>
            </div>

            {/* 5. COLOR SELECTION */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-7 border-t border-line pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink">
                    Colour:{' '}
                    <span className="font-semibold normal-case text-soft">
                      {selectedColor}
                    </span>
                  </p>
                </div>
                <div
                  className="mt-3 flex items-center gap-2.5"
                  role="radiogroup"
                  aria-label="Product colors"
                >
                  {product.colors.map((c) => {
                    const isSelected = selectedColor === c.name
                    return (
                      <button
                        key={c.name}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`Color: ${c.name}`}
                        title={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                          isSelected
                            ? 'border-fox ring-2 ring-fox/30 scale-105 shadow-sm'
                            : 'border-transparent hover:border-line'
                        }`}
                      >
                        <span
                          className="h-5 w-5 rounded-full border border-black/10"
                          style={{ backgroundColor: c.value }}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 4. SIZE SELECTION */}
            <div id="size-selector-area" className="mt-6 border-t border-line pt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-ink">
                  Select Size
                  {selectedSize && (
                    <span className="ml-2 font-normal text-soft normal-case">
                      ({selectedSize})
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-soft hover:text-fox transition-colors underline underline-offset-2"
                >
                  <Ruler size={13} />
                  Size Guide
                </button>
              </div>

              {/* Size JellyRadio Selection */}
              <div className="mt-3 overflow-x-auto pb-1 scrollbar-none">
                <JellyRadio
                  items={ALL_SIZES.map((size) => ({
                    value: size,
                    label: size,
                    disabled: !product.sizes.includes(
                      size as (typeof product.sizes)[number]
                    ),
                  }))}
                  value={selectedSize}
                  onChange={(size) => handleSelectSize(size)}
                  size="md"
                  gap={8}
                  radius={12}
                  swell={0.18}
                  barge={4}
                  shrink={0.04}
                  chipColor="#FAF9F6"
                  activeColor="#E87535"
                  activeTextColor="#ffffff"
                  textColor="#191919"
                  ariaLabel="Product sizes"
                />
              </div>

              {/* Concise Size Validation Error */}
              {sizeError && (
                <p
                  role="alert"
                  className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-fox"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  {sizeError}
                </p>
              )}

              {/* Dynamic Scarcity & High Demand Signals */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-[11px] font-bold text-amber-900">
                  <Zap size={13} className="text-amber-600 fill-amber-600" />
                  {selectedSize
                    ? `Only 2 left in Size ${selectedSize} — order soon`
                    : 'Low stock in popular sizes'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-1 text-[11px] font-medium text-soft">
                  <Flame size={13} className="text-fox" />
                  18 people looking right now
                </span>
              </div>
            </div>

            {/* 6. QUANTITY & ADD TO BAG */}
            <div ref={mainBuyRef} className="mt-7">
              {/* Quantity Selector Group */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink mb-2">
                  Quantity
                </p>
                <div
                  className="pdp-quantity-selector"
                  role="group"
                  aria-label="Select quantity"
                >
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1 || !product.inStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="pdp-qty-btn"
                  >
                    <Minus size={15} strokeWidth={2.2} />
                  </button>
                  <span
                    className="pdp-qty-display"
                    aria-label={`Quantity: ${quantity}`}
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={quantity >= 10 || !product.inStock}
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="pdp-qty-btn"
                  >
                    <Plus size={15} strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              {/* Primary Add to Bag & Wishlist Buttons */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="pdp-add-to-bag-btn flex-1"
                >
                  <span className="pdp-btn-left">
                    <ShoppingBag size={18} strokeWidth={2} className="pdp-btn-icon" />
                    <span className="pdp-btn-label">
                      {product.inStock ? 'ADD TO BAG' : 'OUT OF STOCK'}
                    </span>
                  </span>
                  {product.inStock && (
                    <span className="pdp-btn-price">
                      {formatPrice(product.price * quantity)}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  title={isWishlisted ? "Saved in your Wishlist" : "Save to Wishlist"}
                  className={`h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                    isWishlisted
                      ? 'bg-rose-50 border-rose-300 text-rose-500 shadow-sm'
                      : 'bg-white border-[#E5E1D8] text-neutral-600 hover:border-ink hover:text-ink shadow-sm'
                  }`}
                >
                  <Heart
                    size={22}
                    className={isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-neutral-700'}
                  />
                </button>
              </div>

              {/* PINCODE DELIVERY ESTIMATOR */}
              <div className="mt-6 rounded-2xl border border-line bg-sand/40 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-fox" />
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                      Delivery &amp; Service Availability
                    </span>
                  </div>
                  {pincodeResult && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Deliverable
                    </span>
                  )}
                </div>

                {/* Form Input Row */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleCheckPincode()
                  }}
                  className="mt-3 flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit PIN code"
                      className="w-full h-10 rounded-xl border border-line bg-white px-3.5 text-xs font-semibold text-ink outline-none transition-colors focus:border-fox"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={pincodeLoading || pincode.length !== 6}
                    className="h-10 rounded-xl bg-ink px-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pincodeLoading ? 'Checking...' : 'Check'}
                  </button>
                </form>

                {pincodeError && (
                  <p className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1">
                    <AlertCircle size={13} /> {pincodeError}
                  </p>
                )}

                {pincodeResult && (
                  <div className="mt-3.5 space-y-2 border-t border-line/70 pt-3 text-xs">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-ink">
                          Estimated Delivery by{' '}
                          <span className="text-fox">{pincodeResult.estimatedDate}</span>
                        </p>
                        <p className="text-[11px] text-soft mt-0.5">
                          Delivering to {pincodeResult.city} ({pincodeResult.pincode}) via Express Courier.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-medium text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Truck size={12} className="text-fox" /> Free shipping &gt; ₹1,499
                      </span>
                      <span className="flex items-center gap-1">
                        <RotateCcw size={12} className="text-fox" /> 15-day doorstep exchange
                      </span>
                    </div>

                    {/* Customer Flagship Hub reference */}
                    <div className="pt-2 border-t border-line/40 text-[10.5px] text-soft flex items-center justify-between">
                      <span>Hub: {pincodeResult.hubLocation}</span>
                      <a
                        href="https://maps.google.com/maps?q=16.5168591%2C80.628406&z=17&hl=en"
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-fox hover:underline inline-flex items-center gap-0.5"
                      >
                        View Map ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 7. COMPACT EXPANDABLE SECTIONS (Accordions) */}
            <div className="mt-8 border-t border-line">
              {/* 1. Product Details */}
              <div className="pdp-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion('details')}
                  className="pdp-accordion-trigger"
                  aria-expanded={openAccordions.details}
                >
                  <span>Product Details</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 text-soft ${
                      openAccordions.details ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordions.details && (
                  <div className="pdp-accordion-content">
                    <ul className="list-disc pl-5 space-y-1.5">
                      {product.details?.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      )) || (
                        <>
                          <li>Pure combed cotton construction for daily comfort</li>
                          <li>Pre-shrunk finish to maintain consistent garment dimensions</li>
                          <li>Double-needle topstitching along seams and hems</li>
                          <li>Designed in India for effortless everyday styling</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* 2. Fit & Fabric */}
              <div className="pdp-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion('fitFabric')}
                  className="pdp-accordion-trigger"
                  aria-expanded={openAccordions.fitFabric}
                >
                  <span>Fit &amp; Fabric</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 text-soft ${
                      openAccordions.fitFabric ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordions.fitFabric && (
                  <div className="pdp-accordion-content space-y-2">
                    <p>
                      <strong className="text-ink">Fit: </strong>
                      {product.fitFabric?.fit || 'Relaxed casual cut with an easy drape.'}
                    </p>
                    <p>
                      <strong className="text-ink">Fabric: </strong>
                      {product.fitFabric?.fabric || '100% Breathable cotton weave.'}
                    </p>
                    <p>
                      <strong className="text-ink">Care Instructions: </strong>
                      {product.fitFabric?.care || 'Machine wash cold inside-out. Line dry.'}
                    </p>
                  </div>
                )}
              </div>

              {/* 3. Shipping Information */}
              <div className="pdp-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="pdp-accordion-trigger"
                  aria-expanded={openAccordions.shipping}
                >
                  <span>Shipping Information</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 text-soft ${
                      openAccordions.shipping ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordions.shipping && (
                  <div className="pdp-accordion-content space-y-2">
                    <p>
                      • Free standard shipping across India on orders over ₹1,499.
                    </p>
                    <p>
                      • Orders are dispatched from our fulfillment center within 24–48 hours.
                    </p>
                    <p>
                      • Standard metro delivery arrives in 3–5 business days with full SMS tracking.
                    </p>
                  </div>
                )}
              </div>

              {/* 4. Returns & Exchanges */}
              <div className="pdp-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion('returns')}
                  className="pdp-accordion-trigger"
                  aria-expanded={openAccordions.returns}
                >
                  <span>Returns &amp; Exchanges</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 text-soft ${
                      openAccordions.returns ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordions.returns && (
                  <div className="pdp-accordion-content space-y-2">
                    <p>
                      • 15-day return and exchange window from the date of package delivery.
                    </p>
                    <p>
                      • Unworn garments with intact original brand tags qualify for free reverse pickup.
                    </p>
                    <p>
                      • Fast size exchange or refund to the original payment method upon warehouse scan.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 8. TRIPLE RECOMMENDATION TIERS: SIMILAR PRODUCTS, TRENDING, COMPLETE THE LOOK */}
        <div className="border-t border-line mt-12 sm:mt-16 pt-8 space-y-14 sm:space-y-18 pb-24 sm:pb-32 lg:pb-40">
          
          {/* TIER 1: Similar Products (Matching silhouette / category, 4 per row, 3 cols on tablet) */}
          {similarProducts.length > 0 && (
            <section aria-labelledby="similar-heading">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-soft">
                    <span aria-hidden="true" className="h-[2px] w-5 rounded-full bg-fox" />
                    Same Category &amp; Silhouette
                  </p>
                  <h2 id="similar-heading" className="mt-1.5 font-display text-xl sm:text-2xl font-black uppercase text-ink">
                    Similar Products
                  </h2>
                </div>
                <Link
                  to={`/products?category=${encodeURIComponent(product.category)}`}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink hover:text-fox transition-colors"
                >
                  View all in {product.category} <ArrowRight size={14} />
                </Link>
              </div>

              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-11 lg:gap-x-6">
                {similarProducts.map((rel) => {
                  const currentColor =
                    recProductColors[rel.id] || rel.colors[0]?.name
                  const isItemWishlisted = isInDemoWishlist(rel.id)
                  return (
                    <li className="group min-w-0" key={rel.id}>
                      <div className="relative overflow-hidden bg-[#eeeae3] rounded-sm">
                        <Link
                          to={`/products/${rel.id}`}
                          aria-label={`View ${rel.name}`}
                          className="block focus-visible:outline-2 focus-visible:outline-ink"
                        >
                          <img
                            src={rel.image}
                            alt={rel.alt}
                            width="1024"
                            height="1536"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = getCategoryFallbackImage(rel.category)
                            }}
                            className="aspect-[3/4] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                          />
                        </Link>

                        {/* Badges */}
                        {!rel.inStock ? (
                          <div className="absolute top-2.5 left-2.5 bg-ink text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-xs">
                            Sold Out
                          </div>
                        ) : rel.isBestseller ? (
                          <div className="absolute top-2.5 left-2.5 bg-paper/95 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-ink shadow-xs">
                            Bestseller
                          </div>
                        ) : rel.isNew ? (
                          <div className="absolute top-2.5 left-2.5 bg-paper/95 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-ink shadow-xs">
                            New
                          </div>
                        ) : null}

                        {/* Wishlist Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            if (!isDemoLoggedIn()) {
                              showToast('Please create an account or sign in to save items to your wishlist.', { type: 'info' })
                              navigate('/login', {
                                state: {
                                  from: `/products/${product.id}`,
                                  reason: 'Please create an account or sign in to save items to your wishlist.'
                                }
                              })
                              return
                            }
                            const added = toggleDemoWishlist(rel.id)
                            showToast(added ? `Saved ${rel.name} to Wishlist` : `Removed ${rel.name} from Wishlist`, {
                              type: added ? 'success' : 'info'
                            })
                          }}
                          aria-label={isItemWishlisted ? `Remove ${rel.name} from wishlist` : `Save ${rel.name} to wishlist`}
                          className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm backdrop-blur-xs transition-transform hover:scale-110 hover:bg-white cursor-pointer"
                        >
                          <Heart
                            size={14}
                            className={isItemWishlisted ? 'fill-rose-500 text-rose-500' : 'text-neutral-700'}
                          />
                        </button>

                        {/* Quick Add Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!isDemoLoggedIn()) {
                              showToast('Please create an account or sign in to add items to your bag.', { type: 'info' })
                              navigate('/login', {
                                state: {
                                  from: `/products/${product.id}`,
                                  pendingAdd: {
                                    product: rel,
                                    color: currentColor,
                                    size: rel.sizes?.[0] || 'M',
                                    qty: 1
                                  },
                                  reason: 'Please create an account or sign in to add items to your bag.'
                                }
                              })
                              return
                            }
                            addToCart(rel, currentColor)
                          }}
                          disabled={!rel.inStock}
                          aria-label={`Quick add ${rel.name} to bag`}
                          className={`absolute bottom-3 right-3 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center text-ink shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-fox ${
                            rel.inStock
                              ? 'bg-white hover:bg-fox hover:text-white cursor-pointer'
                              : 'cursor-not-allowed bg-white/70 text-soft'
                          }`}
                        >
                          <Plus size={16} strokeWidth={2} />
                        </button>
                      </div>

                      <div className="mt-3.5 flex flex-col gap-1 sm:mt-4">
                        <Link
                          to={`/products/${rel.id}`}
                          className="w-fit text-[12px] font-semibold leading-snug text-ink transition-colors hover:text-fox-deep sm:text-[14px]"
                        >
                          {rel.name}
                        </Link>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[12px] font-semibold text-ink sm:text-[14px]">
                            {formatPrice(rel.price)}
                          </span>
                          {rel.originalPrice && rel.originalPrice > rel.price && (
                            <span className="text-[11px] font-normal text-soft line-through sm:text-[12px]">
                              {formatPrice(rel.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {rel.colors && rel.colors.length > 0 && (
                        <div
                          className="mt-3 flex items-center gap-1.5"
                          aria-label={`Colours for ${rel.name}`}
                        >
                          {rel.colors.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              aria-label={`${rel.name} in ${c.name}`}
                              aria-pressed={currentColor === c.name}
                              onClick={() =>
                                setRecProductColors((prev) => ({
                                  ...prev,
                                  [rel.id]: c.name,
                                }))
                              }
                              className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border transition-colors hover:border-ink ${
                                currentColor === c.name ? 'border-fox ring-1 ring-fox/40' : 'border-transparent'
                              }`}
                            >
                              <span
                                className="h-3 w-3 rounded-full border border-black/10"
                                style={{ backgroundColor: c.value }}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* TIER 2: Trending Now (Top bestsellers & rail favorites, 4 per row, 3 cols on tablet) */}
          {trendingProducts.length > 0 && (
            <section aria-labelledby="trending-heading">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-soft">
                    <span aria-hidden="true" className="h-[2px] w-5 rounded-full bg-fox" />
                    Community Most Wanted
                  </p>
                  <h2 id="trending-heading" className="mt-1.5 font-display text-xl sm:text-2xl font-black uppercase text-ink">
                    Trending Now
                  </h2>
                </div>
                <Link
                  to="/products"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink hover:text-fox transition-colors"
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-11 lg:gap-x-6">
                {trendingProducts.map((rel) => {
                  const currentColor =
                    recProductColors[rel.id] || rel.colors[0]?.name
                  const isItemWishlisted = isInDemoWishlist(rel.id)
                  return (
                    <li className="group min-w-0" key={rel.id}>
                      <div className="relative overflow-hidden bg-[#eeeae3] rounded-sm">
                        <Link
                          to={`/products/${rel.id}`}
                          aria-label={`View ${rel.name}`}
                          className="block focus-visible:outline-2 focus-visible:outline-ink"
                        >
                          <img
                            src={rel.image}
                            alt={rel.alt}
                            width="1024"
                            height="1536"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = getCategoryFallbackImage(rel.category)
                            }}
                            className="aspect-[3/4] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                          />
                        </Link>

                        {/* Badges */}
                        {!rel.inStock ? (
                          <div className="absolute top-2.5 left-2.5 bg-ink text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-xs">
                            Sold Out
                          </div>
                        ) : rel.isBestseller ? (
                          <div className="absolute top-2.5 left-2.5 bg-paper/95 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-ink shadow-xs">
                            Bestseller
                          </div>
                        ) : rel.isNew ? (
                          <div className="absolute top-2.5 left-2.5 bg-paper/95 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-ink shadow-xs">
                            New
                          </div>
                        ) : null}

                        {/* Wishlist Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            if (!isDemoLoggedIn()) {
                              showToast('Please create an account or sign in to save items to your wishlist.', { type: 'info' })
                              navigate('/login', {
                                state: {
                                  from: `/products/${product.id}`,
                                  reason: 'Please create an account or sign in to save items to your wishlist.'
                                }
                              })
                              return
                            }
                            const added = toggleDemoWishlist(rel.id)
                            showToast(added ? `Saved ${rel.name} to Wishlist` : `Removed ${rel.name} from Wishlist`, {
                              type: added ? 'success' : 'info'
                            })
                          }}
                          aria-label={isItemWishlisted ? `Remove ${rel.name} from wishlist` : `Save ${rel.name} to wishlist`}
                          className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm backdrop-blur-xs transition-transform hover:scale-110 hover:bg-white cursor-pointer"
                        >
                          <Heart
                            size={14}
                            className={isItemWishlisted ? 'fill-rose-500 text-rose-500' : 'text-neutral-700'}
                          />
                        </button>

                        {/* Quick Add Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!isDemoLoggedIn()) {
                              showToast('Please create an account or sign in to add items to your bag.', { type: 'info' })
                              navigate('/login', {
                                state: {
                                  from: `/products/${product.id}`,
                                  pendingAdd: {
                                    product: rel,
                                    color: currentColor,
                                    size: rel.sizes?.[0] || 'M',
                                    qty: 1
                                  },
                                  reason: 'Please create an account or sign in to add items to your bag.'
                                }
                              })
                              return
                            }
                            addToCart(rel, currentColor)
                          }}
                          disabled={!rel.inStock}
                          aria-label={`Quick add ${rel.name} to bag`}
                          className={`absolute bottom-3 right-3 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center text-ink shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-fox ${
                            rel.inStock
                              ? 'bg-white hover:bg-fox hover:text-white cursor-pointer'
                              : 'cursor-not-allowed bg-white/70 text-soft'
                          }`}
                        >
                          <Plus size={16} strokeWidth={2} />
                        </button>
                      </div>

                      <div className="mt-3.5 flex flex-col gap-1 sm:mt-4">
                        <Link
                          to={`/products/${rel.id}`}
                          className="w-fit text-[12px] font-semibold leading-snug text-ink transition-colors hover:text-fox-deep sm:text-[14px]"
                        >
                          {rel.name}
                        </Link>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[12px] font-semibold text-ink sm:text-[14px]">
                            {formatPrice(rel.price)}
                          </span>
                          {rel.originalPrice && rel.originalPrice > rel.price && (
                            <span className="text-[11px] font-normal text-soft line-through sm:text-[12px]">
                              {formatPrice(rel.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {rel.colors && rel.colors.length > 0 && (
                        <div
                          className="mt-3 flex items-center gap-1.5"
                          aria-label={`Colours for ${rel.name}`}
                        >
                          {rel.colors.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              aria-label={`${rel.name} in ${c.name}`}
                              aria-pressed={currentColor === c.name}
                              onClick={() =>
                                setRecProductColors((prev) => ({
                                  ...prev,
                                  [rel.id]: c.name,
                                }))
                              }
                              className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border transition-colors hover:border-ink ${
                                currentColor === c.name ? 'border-fox ring-1 ring-fox/40' : 'border-transparent'
                              }`}
                            >
                              <span
                                className="h-3 w-3 rounded-full border border-black/10"
                                style={{ backgroundColor: c.value }}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* TIER 3: Complete The Look / Matching Pairs (Cross-category layering, 4 per row, 3 cols on tablet) */}
          {completeLookProducts.length > 0 && (
            <section aria-labelledby="complete-heading">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-soft">
                    <span aria-hidden="true" className="h-[2px] w-5 rounded-full bg-fox" />
                    Layering &amp; Styling Guide
                  </p>
                  <h2 id="complete-heading" className="mt-1.5 font-display text-xl sm:text-2xl font-black uppercase text-ink">
                    Complete The Look
                  </h2>
                </div>
                <Link
                  to="/products"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink hover:text-fox transition-colors"
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-11 lg:gap-x-6">
                {completeLookProducts.map((rel) => {
                  const currentColor =
                    recProductColors[rel.id] || rel.colors[0]?.name
                  const isItemWishlisted = isInDemoWishlist(rel.id)
                  return (
                    <li className="group min-w-0" key={rel.id}>
                      <div className="relative overflow-hidden bg-[#eeeae3] rounded-sm">
                        <Link
                          to={`/products/${rel.id}`}
                          aria-label={`View ${rel.name}`}
                          className="block focus-visible:outline-2 focus-visible:outline-ink"
                        >
                          <img
                            src={rel.image}
                            alt={rel.alt}
                            width="1024"
                            height="1536"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = getCategoryFallbackImage(rel.category)
                            }}
                            className="aspect-[3/4] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                          />
                        </Link>

                        {/* Badges */}
                        {!rel.inStock ? (
                          <div className="absolute top-2.5 left-2.5 bg-ink text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-xs">
                            Sold Out
                          </div>
                        ) : rel.isBestseller ? (
                          <div className="absolute top-2.5 left-2.5 bg-paper/95 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-ink shadow-xs">
                            Bestseller
                          </div>
                        ) : rel.isNew ? (
                          <div className="absolute top-2.5 left-2.5 bg-paper/95 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-ink shadow-xs">
                            New
                          </div>
                        ) : null}

                        {/* Wishlist Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            if (!isDemoLoggedIn()) {
                              showToast('Please create an account or sign in to save items to your wishlist.', { type: 'info' })
                              navigate('/login', {
                                state: {
                                  from: `/products/${product.id}`,
                                  reason: 'Please create an account or sign in to save items to your wishlist.'
                                }
                              })
                              return
                            }
                            const added = toggleDemoWishlist(rel.id)
                            showToast(added ? `Saved ${rel.name} to Wishlist` : `Removed ${rel.name} from Wishlist`, {
                              type: added ? 'success' : 'info'
                            })
                          }}
                          aria-label={isItemWishlisted ? `Remove ${rel.name} from wishlist` : `Save ${rel.name} to wishlist`}
                          className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm backdrop-blur-xs transition-transform hover:scale-110 hover:bg-white cursor-pointer"
                        >
                          <Heart
                            size={14}
                            className={isItemWishlisted ? 'fill-rose-500 text-rose-500' : 'text-neutral-700'}
                          />
                        </button>

                        {/* Quick Add Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!isDemoLoggedIn()) {
                              showToast('Please create an account or sign in to add items to your bag.', { type: 'info' })
                              navigate('/login', {
                                state: {
                                  from: `/products/${product.id}`,
                                  pendingAdd: {
                                    product: rel,
                                    color: currentColor,
                                    size: rel.sizes?.[0] || 'M',
                                    qty: 1
                                  },
                                  reason: 'Please create an account or sign in to add items to your bag.'
                                }
                              })
                              return
                            }
                            addToCart(rel, currentColor)
                          }}
                          disabled={!rel.inStock}
                          aria-label={`Quick add ${rel.name} to bag`}
                          className={`absolute bottom-3 right-3 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center text-ink shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-fox ${
                            rel.inStock
                              ? 'bg-white hover:bg-fox hover:text-white cursor-pointer'
                              : 'cursor-not-allowed bg-white/70 text-soft'
                          }`}
                        >
                          <Plus size={16} strokeWidth={2} />
                        </button>
                      </div>

                      <div className="mt-3.5 flex flex-col gap-1 sm:mt-4">
                        <Link
                          to={`/products/${rel.id}`}
                          className="w-fit text-[12px] font-semibold leading-snug text-ink transition-colors hover:text-fox-deep sm:text-[14px]"
                        >
                          {rel.name}
                        </Link>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[12px] font-semibold text-ink sm:text-[14px]">
                            {formatPrice(rel.price)}
                          </span>
                          {rel.originalPrice && rel.originalPrice > rel.price && (
                            <span className="text-[11px] font-normal text-soft line-through sm:text-[12px]">
                              {formatPrice(rel.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {rel.colors && rel.colors.length > 0 && (
                        <div
                          className="mt-3 flex items-center gap-1.5"
                          aria-label={`Colours for ${rel.name}`}
                        >
                          {rel.colors.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              aria-label={`${rel.name} in ${c.name}`}
                              aria-pressed={currentColor === c.name}
                              onClick={() =>
                                setRecProductColors((prev) => ({
                                  ...prev,
                                  [rel.id]: c.name,
                                }))
                              }
                              className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border transition-colors hover:border-ink ${
                                currentColor === c.name ? 'border-fox ring-1 ring-fox/40' : 'border-transparent'
                              }`}
                            >
                              <span
                                className="h-3 w-3 rounded-full border border-black/10"
                                style={{ backgroundColor: c.value }}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

        </div>
      </div>

      {/* RESPONSIVE STICKY ADD TO BAG BAR (Desktop & Mobile) - REDESIGNED */}
      <div
        className={`pdp-sticky-bar ${showStickyBar ? 'pdp-sticky-bar--visible' : ''}`}
        aria-hidden={!showStickyBar}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Left: Product Thumbnail & Title/Price/Variant Info */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <img
              src={images[0]}
              alt={product.name}
              className="h-12 w-10 sm:h-14 sm:w-11 rounded-lg border border-line bg-sand object-cover object-top shrink-0 shadow-xs"
            />
            <div className="min-w-0">
              <p className="truncate text-xs sm:text-sm font-black uppercase tracking-tight text-ink font-display leading-tight">
                {product.name}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-extrabold text-xs sm:text-sm text-fox font-sans">
                  {formatPrice(product.price * quantity)}
                </span>
                <span className="text-soft/40 hidden sm:inline" aria-hidden="true">•</span>
                <span className="text-xs text-soft font-medium hidden sm:inline">
                  {selectedColor}
                </span>
                {selectedSize ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-sand text-ink text-[10.5px] font-bold border border-line">
                    Size {selectedSize}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10.5px] font-bold border border-amber-200">
                    Select Size
                  </span>
                )}
                {quantity > 1 && (
                  <span className="text-[11px] text-soft">
                    Qty: {quantity}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Size Pills + Wishlist + Primary Add to Bag Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Size Pills (shown on desktop if size not selected) */}
            {!selectedSize && product.sizes && product.sizes.length > 0 && (
              <div className="hidden md:flex items-center gap-1.5 mr-1" aria-label="Quick select size">
                {product.sizes.map((sz: string) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleSelectSize(sz)}
                    className="h-8 min-w-[2rem] px-2 rounded-lg border border-line bg-white hover:border-fox hover:text-fox text-xs font-bold text-ink transition-colors cursor-pointer"
                  >
                    {sz}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Wishlist Heart Button */}
            <button
              type="button"
              onClick={handleToggleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              title={isWishlisted ? "Saved in your Wishlist" : "Save to Wishlist"}
              className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                isWishlisted
                  ? 'bg-rose-50 border-rose-300 text-rose-500'
                  : 'bg-white border-line text-neutral-600 hover:border-ink hover:text-ink'
              }`}
            >
              <Heart
                size={17}
                className={isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-neutral-700'}
              />
            </button>

            {/* Redesigned Primary Action Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`h-10 sm:h-11 px-5 sm:px-7 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm active:scale-[0.98] ${
                !product.inStock
                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                  : !selectedSize
                  ? 'bg-ink text-white hover:bg-neutral-800 cursor-pointer'
                  : 'bg-fox hover:bg-fox-deep text-white cursor-pointer shadow-orange-500/20'
              }`}
            >
              <ShoppingBag size={15} strokeWidth={2.2} />
              <span>
                {!selectedSize
                  ? 'Select Size'
                  : product.inStock
                  ? `Add to Bag • ${formatPrice(product.price * quantity)}`
                  : 'Out of Stock'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* SIZE GUIDE MODAL */}
      {isSizeGuideOpen && (
        <div
          className="pdp-modal-overlay"
          onClick={() => setIsSizeGuideOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Size Guide"
        >
          <div
            className="pdp-modal-dialog rounded-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="font-display text-lg font-black uppercase text-ink">
                  Men's Size Guide
                </h2>
                <p className="text-xs text-soft mt-0.5">
                  Standard measurements in inches &amp; centimeters
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-1 text-ink hover:text-fox transition-colors"
                aria-label="Close size guide"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-line font-bold text-ink">
                    <th className="py-2.5 pr-4">Size</th>
                    <th className="py-2.5 px-4">Chest (in)</th>
                    <th className="py-2.5 px-4">Waist (in)</th>
                    <th className="py-2.5 pl-4">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-soft">
                  <tr>
                    <td className="py-2.5 pr-4 font-bold text-ink">S</td>
                    <td className="py-2.5 px-4">38" (96 cm)</td>
                    <td className="py-2.5 px-4">30" (76 cm)</td>
                    <td className="py-2.5 pl-4">27.5" (70 cm)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-bold text-ink">M</td>
                    <td className="py-2.5 px-4">40" (101 cm)</td>
                    <td className="py-2.5 px-4">32" (81 cm)</td>
                    <td className="py-2.5 pl-4">28.5" (72 cm)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-bold text-ink">L</td>
                    <td className="py-2.5 px-4">42" (106 cm)</td>
                    <td className="py-2.5 px-4">34" (86 cm)</td>
                    <td className="py-2.5 pl-4">29.5" (75 cm)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-bold text-ink">XL</td>
                    <td className="py-2.5 px-4">44" (112 cm)</td>
                    <td className="py-2.5 px-4">36" (91 cm)</td>
                    <td className="py-2.5 pl-4">30.5" (77 cm)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-bold text-ink">XXL</td>
                    <td className="py-2.5 px-4">46" (117 cm)</td>
                    <td className="py-2.5 px-4">38" (96 cm)</td>
                    <td className="py-2.5 pl-4">31.5" (80 cm)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-5 rounded border border-line bg-sand/40 p-3 text-xs text-soft space-y-1">
              <p>
                <strong className="text-ink">Fit Advice:</strong> All FUNKY FOX garments are cut with a comfortable everyday drape. For a fitted look, select one size smaller.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="rounded-full bg-ink px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-paper hover:bg-fox transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  )
}
