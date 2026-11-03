import * as React from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  RotateCcw,
  Check,
  Plus,
  Heart,
} from 'lucide-react'
import {
  products as allProducts,
  categories,
  formatPrice,
  getCategoryFallbackImage,
  ALL_SIZES,
  type Product,
} from '../data/products'
import { isDemoLoggedIn, toggleDemoWishlist, getDemoWishlist } from '../data/accountMockData'
import { showToast } from '../utils/toast'
import { matchesProductSearch, findTypoSuggestions } from '../utils/search'
import { EmptyState } from './feedback'
import Footer from './Footer'
import './ShopPage.css'

interface ShopPageProps {
  addToCart: (product: Product, color?: string, size?: string) => void
}

const CATEGORY_ITEMS = [
  'All Products',
  'T-Shirts',
  'Shirts',
  'Trousers & Jeans',
  'Jackets',
] as const

const SIZE_OPTIONS = ALL_SIZES

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under-750', label: 'Under ₹750', min: 0, max: 749 },
  { id: '750-1200', label: '₹750 – ₹1,200', min: 750, max: 1200 },
  { id: 'over-1200', label: 'Over ₹1,200', min: 1201, max: Infinity },
]

type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc'

export default function ShopPage({ addToCart }: ShopPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [wishlist, setWishlist] = React.useState<string[]>(() => getDemoWishlist())

  React.useEffect(() => {
    const syncWishlist = () => setWishlist(getDemoWishlist())
    window.addEventListener('funky-fox-wishlist-change', syncWishlist)
    return () => window.removeEventListener('funky-fox-wishlist-change', syncWishlist)
  }, [])

  const handleToggleCardWishlist = (e: React.MouseEvent, prod: Product) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDemoLoggedIn()) {
      showToast('Please create an account or sign in to save items to your wishlist.', { type: 'info' })
      navigate('/login', {
        state: {
          from: '/products',
          reason: 'Please create an account or sign in to save items to your wishlist.'
        }
      })
      return
    }
    const added = toggleDemoWishlist(prod.id)
    setWishlist(getDemoWishlist())
    showToast(added ? `Saved ${prod.name} to Wishlist` : `Removed ${prod.name} from Wishlist`, {
      type: added ? 'success' : 'info'
    })
  }

  // Category & Search from URL searchParams
  const categoryParam = searchParams.get('category')
  const searchQuery = searchParams.get('search') || searchParams.get('q') || ''
  const activeCategory =
    categoryParam && categories.includes(categoryParam as (typeof categories)[number])
      ? categoryParam
      : 'All Products'

  // Filter States
  const [selectedSizes, setSelectedSizes] = React.useState<string[]>([])
  const [selectedColors, setSelectedColors] = React.useState<string[]>([])
  const [selectedPriceRange, setSelectedPriceRange] = React.useState<string>('all')
  const [onlyInStock, setOnlyInStock] = React.useState<boolean>(false)
  const [sortBy, setSortBy] = React.useState<SortOption>('featured')
  const [storeTick, setStoreTick] = React.useState<number>(0)

  // Live Storefront Synchronization with Admin Store
  React.useEffect(() => {
    const handleSync = () => setStoreTick((t) => t + 1)
    window.addEventListener('funkyfox:store_updated', handleSync)
    return () => window.removeEventListener('funkyfox:store_updated', handleSync)
  }, [])

  // UI state for popovers (desktop) and drawer (mobile)
  const [openPopover, setOpenPopover] = React.useState<string | null>(null)
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState<boolean>(false)
  const [selectedProductColors, setSelectedProductColors] = React.useState<Record<string, string>>({})

  // Close desktop popovers when clicking outside
  const popoverRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpenPopover(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lock body scroll when mobile drawer is open
  React.useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileDrawerOpen])

  // Extract unique colors available across all products
  const availableColors = React.useMemo(() => {
    const map = new Map<string, string>()
    allProducts.forEach((p) => {
      p.colors.forEach((c) => {
        if (!map.has(c.name)) {
          map.set(c.name, c.value)
        }
      })
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [allProducts, storeTick])

  // Handle Category Change
  const handleCategorySelect = (cat: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (cat === 'All Products') {
      newParams.delete('category')
    } else {
      newParams.set('category', cat)
    }
    setSearchParams(newParams, { replace: true })
  }

  // Toggle Size
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  // Toggle Color
  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    )
  }

  // Reset all filters
  const resetFilters = () => {
    setSelectedSizes([])
    setSelectedColors([])
    setSelectedPriceRange('all')
    setOnlyInStock(false)
  }

  // Full reset including category and search
  const resetAll = () => {
    resetFilters()
    handleCategorySelect('All Products')
    if (searchQuery) {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('search')
      newParams.delete('q')
      setSearchParams(newParams, { replace: true })
    }
  }

  // Calculate active filter counts
  const toolbarActiveCount =
    (searchQuery.trim() ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (selectedPriceRange !== 'all' ? 1 : 0) +
    (onlyInStock ? 1 : 0)

  const activeFilterCount =
    (activeCategory !== 'All Products' ? 1 : 0) + toolbarActiveCount

  // Filter products
  const filteredProducts = React.useMemo(() => {
    return allProducts.filter((product) => {
      // 0. Search Query Filter using shared search normalizer
      if (searchQuery.trim() && !matchesProductSearch(product, searchQuery)) {
        return false
      }

      // 1. Category Filter
      if (activeCategory !== 'All Products' && product.category !== activeCategory) {
        return false
      }

      // 2. Size Filter (product must have at least one of the selected sizes)
      if (selectedSizes.length > 0) {
        const hasSize = product.sizes.some((s) => selectedSizes.includes(s))
        if (!hasSize) return false
      }

      // 3. Color Filter (product must have at least one of the selected colors)
      if (selectedColors.length > 0) {
        const hasColor = product.colors.some((c) => selectedColors.includes(c.name))
        if (!hasColor) return false
      }

      // 4. Price Filter
      if (selectedPriceRange !== 'all') {
        const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange)
        if (range && (product.price < range.min || product.price > range.max)) {
          return false
        }
      }

      // 5. Availability Filter
      if (onlyInStock && !product.inStock) {
        return false
      }

      return true
    })
  }, [searchQuery, activeCategory, selectedSizes, selectedColors, selectedPriceRange, onlyInStock])

  // Sort filtered products
  const sortedProducts = React.useMemo(() => {
    const list = [...filteredProducts]
    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price)
      case 'featured':
      default:
        return list.sort((a, b) => a.featuredOrder - b.featuredOrder)
    }
  }, [filteredProducts, sortBy])

  // Progressive loading / pagination to smoothly handle large catalogues
  const PAGE_SIZE = 24
  const [visibleCount, setVisibleCount] = React.useState<number>(PAGE_SIZE)

  // Reset pagination whenever filters or category changes
  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [searchQuery, activeCategory, selectedSizes, selectedColors, selectedPriceRange, onlyInStock, sortBy])

  const visibleProducts = React.useMemo(() => {
    return sortedProducts.slice(0, visibleCount)
  }, [sortedProducts, visibleCount])

  // Formatted accurate product count
  const productCountLabel = React.useMemo(() => {
    const isFiltered = activeCategory !== 'All Products' || toolbarActiveCount > 0
    if (isFiltered) {
      if (visibleProducts.length < filteredProducts.length) {
        return `SHOWING ${visibleProducts.length} OF ${filteredProducts.length} PRODUCTS FOUND`
      }
      return `${filteredProducts.length} ${filteredProducts.length === 1 ? 'PRODUCT' : 'PRODUCTS'} FOUND`
    }
    if (visibleProducts.length < allProducts.length) {
      return `SHOWING ${visibleProducts.length} OF ${allProducts.length} PRODUCTS`
    }
    return `${allProducts.length} PRODUCTS`
  }, [activeCategory, toolbarActiveCount, visibleProducts.length, filteredProducts.length])

  return (
    <div className="shop-page">
      <div className="shop-container">
        {/* Breadcrumb */}
        <div className="pt-4 sm:pt-5 pb-1">
          <Link
            to="/#home"
            className="text-xs font-semibold text-soft transition-colors hover:text-fox"
          >
            Home / Shop
          </Link>
        </div>

        {/* 1. PAGE HEADER */}
        <header className="border-b border-line pb-4 pt-3 sm:pb-5 sm:pt-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-soft sm:text-[10.5px]">
                <span aria-hidden="true" className="h-[2.5px] w-6 rounded-full bg-fox" />
                The Collection
              </p>
              {/* Main Heading */}
              <h1 className="mt-1.5 sm:mt-2 font-display text-2xl font-black uppercase leading-[1] tracking-[-0.03em] text-ink sm:text-3xl lg:text-[2.25rem]">
                All The Good Stuff.
              </h1>
              {/* Supporting Text */}
              <p className="mt-1 text-xs sm:text-[13.5px] leading-relaxed text-soft">
                Find your everyday favourites, from essential tees to easy layers.
              </p>
            </div>

            {/* Accurate Product Count */}
            <div className="mt-1 sm:mt-0 flex items-center gap-2 text-xs font-semibold tracking-wider text-soft uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-fox" aria-hidden="true" />
              <span>{productCountLabel}</span>
            </div>
          </div>
        </header>

        {/* 2. CATEGORY NAVIGATION ROW */}
        <nav aria-label="Browse by category" className="shop-category-nav">
          {CATEGORY_ITEMS.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`shop-category-tab ${
                  isActive ? 'shop-category-tab--active' : ''
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {cat}
              </button>
            )
          })}
        </nav>

        {/* 3. FILTERS & SORTING TOOLBAR */}
        <section aria-label="Shopping controls" className="shop-toolbar" ref={popoverRef}>
          {/* Desktop Filter Controls */}
          <div className="hidden items-center gap-2.5 md:flex">
            {/* Size Filter Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenPopover(openPopover === 'size' ? null : 'size')
                }
                className={`shop-filter-btn ${
                  selectedSizes.length > 0 ? 'shop-filter-btn--active' : ''
                }`}
                aria-expanded={openPopover === 'size'}
              >
                <span>
                  Size
                  {selectedSizes.length > 0 ? ` (${selectedSizes.length})` : ''}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    openPopover === 'size' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openPopover === 'size' && (
                <div className="shop-popover">
                  <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-soft">
                    Select Size
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SIZE_OPTIONS.map((size) => {
                      const isSelected = selectedSizes.includes(size)
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`flex h-9 w-10 items-center justify-center border text-xs font-bold transition-colors ${
                            isSelected
                              ? 'border-ink bg-ink text-white'
                              : 'border-line text-ink hover:border-ink'
                          }`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Color Filter Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenPopover(openPopover === 'color' ? null : 'color')
                }
                className={`shop-filter-btn ${
                  selectedColors.length > 0 ? 'shop-filter-btn--active' : ''
                }`}
                aria-expanded={openPopover === 'color'}
              >
                <span>
                  Color
                  {selectedColors.length > 0 ? ` (${selectedColors.length})` : ''}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    openPopover === 'color' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openPopover === 'color' && (
                <div className="shop-popover min-w-[15rem]">
                  <p className="mb-2.5 text-[10.5px] font-bold uppercase tracking-wider text-soft">
                    Select Colors
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {availableColors.map((col) => {
                      const isSelected = selectedColors.includes(col.name)
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => toggleColor(col.name)}
                          className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
                            isSelected ? 'bg-sand font-bold' : 'hover:bg-sand/60'
                          }`}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: col.value }}
                          />
                          <span className="truncate">{col.name}</span>
                          {isSelected && (
                            <Check size={12} className="ml-auto text-fox shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Price Filter Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenPopover(openPopover === 'price' ? null : 'price')
                }
                className={`shop-filter-btn ${
                  selectedPriceRange !== 'all' ? 'shop-filter-btn--active' : ''
                }`}
                aria-expanded={openPopover === 'price'}
              >
                <span>
                  Price
                  {selectedPriceRange !== 'all' ? ' (1)' : ''}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    openPopover === 'price' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openPopover === 'price' && (
                <div className="shop-popover min-w-[12rem]">
                  <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-soft">
                    Price Range
                  </p>
                  <div className="flex flex-col gap-1">
                    {PRICE_RANGES.map((rng) => {
                      const isSelected = selectedPriceRange === rng.id
                      return (
                        <button
                          key={rng.id}
                          type="button"
                          onClick={() => {
                            setSelectedPriceRange(rng.id)
                            setOpenPopover(null)
                          }}
                          className={`flex items-center justify-between rounded px-2.5 py-1.5 text-left text-xs transition-colors ${
                            isSelected
                              ? 'bg-sand font-bold text-ink'
                              : 'text-soft hover:bg-sand/60 hover:text-ink'
                          }`}
                        >
                          <span>{rng.label}</span>
                          {isSelected && <Check size={12} className="text-fox" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Availability Toggle */}
            <button
              type="button"
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`shop-filter-btn ${
                onlyInStock ? 'shop-filter-btn--active' : ''
              }`}
              aria-pressed={onlyInStock}
            >
              <span>In Stock Only</span>
              {onlyInStock && <Check size={12} className="text-paper" />}
            </button>

            {/* Clear Filters (Desktop) */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetAll}
                className="shop-reset-btn"
                aria-label="Reset all filters"
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Mobile Filter Trigger Button & Reset */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className={`shop-filter-btn ${
                toolbarActiveCount > 0 ? 'shop-filter-btn--active' : ''
              }`}
              aria-label={`Open filters${toolbarActiveCount > 0 ? `, ${toolbarActiveCount} active` : ''}`}
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {toolbarActiveCount > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-fox px-1.5 text-[10px] font-bold text-white">
                  {toolbarActiveCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetAll}
                className="shop-reset-btn"
                aria-label="Reset all filters"
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Sorting Control */}
          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="shop-sort" className="font-semibold text-soft">
              Sort:
            </label>
            <div className="relative">
              <select
                id="shop-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort products"
                className="shop-sort-select"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-soft"
                aria-hidden="true"
              />
            </div>
          </div>
        </section>

        {/* Active Filter Chips Row */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2.5 pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-soft">
              Active:
            </span>

            {searchQuery.trim() && (
              <span className="shop-active-chip">
                <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams)
                    newParams.delete('search')
                    newParams.delete('q')
                    setSearchParams(newParams, { replace: true })
                  }}
                  aria-label={`Remove search filter for ${searchQuery}`}
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {activeCategory !== 'All Products' && (
              <span className="shop-active-chip">
                <span>Category: {activeCategory}</span>
                <button
                  type="button"
                  onClick={() => handleCategorySelect('All Products')}
                  aria-label={`Remove category filter for ${activeCategory}`}
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedSizes.map((size) => (
              <span key={size} className="shop-active-chip">
                <span>Size: {size}</span>
                <button
                  type="button"
                  onClick={() => toggleSize(size)}
                  aria-label={`Remove size filter for ${size}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {selectedColors.map((color) => (
              <span key={color} className="shop-active-chip">
                <span>Color: {color}</span>
                <button
                  type="button"
                  onClick={() => toggleColor(color)}
                  aria-label={`Remove color filter for ${color}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {selectedPriceRange !== 'all' && (
              <span className="shop-active-chip">
                <span>
                  Price:{' '}
                  {PRICE_RANGES.find((r) => r.id === selectedPriceRange)?.label}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPriceRange('all')}
                  aria-label="Remove price filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {onlyInStock && (
              <span className="shop-active-chip">
                <span>In Stock Only</span>
                <button
                  type="button"
                  onClick={() => setOnlyInStock(false)}
                  aria-label="Remove in-stock filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={resetAll}
              className="ml-1 text-[11px] font-bold uppercase tracking-wider text-fox underline hover:text-fox-deep"
            >
              Clear All
            </button>
          </div>
        )}

        {/* 4. PRODUCT GRID & 5. PRODUCT INTERACTIONS */}
        <section aria-label="Product list" className="py-8 sm:py-12">
          {sortedProducts.length > 0 ? (
            <>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-11 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
                {visibleProducts.map((product) => {
                  const currentColorName =
                    selectedProductColors[product.id] || product.colors[0]?.name
                  return (
                    <li className="group min-w-0" key={product.id}>
                      <div className="relative overflow-hidden bg-[#eeeae3]">
                        <Link
                          to={`/products/${product.id}`}
                          aria-label={`View ${product.name}`}
                          className="block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink"
                        >
                          <img
                            src={product.image}
                            alt={product.alt}
                            width="1024"
                            height="1536"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = getCategoryFallbackImage(product.category)
                            }}
                            className="aspect-[3/4] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                          />
                        </Link>

                        {/* Badges: Sold Out, Bestseller, New */}
                        {!product.inStock ? (
                          <div className="shop-sold-out-badge">
                            Sold Out
                          </div>
                        ) : product.isBestseller ? (
                          <div className="absolute top-2.5 left-2.5 bg-paper/95 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-ink shadow-sm">
                            Bestseller
                          </div>
                        ) : product.isNew ? (
                          <div className="absolute top-2.5 left-2.5 bg-paper/95 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-ink shadow-sm">
                            New
                          </div>
                        ) : null}

                        {/* Card Wishlist Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleCardWishlist(e, product)}
                          aria-label={
                            wishlist.includes(product.id)
                              ? `Remove ${product.name} from wishlist`
                              : `Save ${product.name} to wishlist`
                          }
                          title={
                            wishlist.includes(product.id)
                              ? 'Saved in Wishlist'
                              : 'Save to Wishlist'
                          }
                          className="absolute top-2.5 right-2.5 z-10 flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm backdrop-blur-xs transition-transform hover:scale-110 hover:bg-white cursor-pointer touch-manipulation"
                        >
                          <Heart
                            size={15}
                            className={
                              wishlist.includes(product.id)
                                ? 'fill-rose-500 text-rose-500'
                                : 'text-neutral-700'
                            }
                          />
                        </button>

                        {/* Quick Add Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!isDemoLoggedIn()) {
                              showToast('Please create an account or sign in to add items to your bag.', {
                                type: 'info'
                              })
                              navigate('/login', {
                                state: {
                                  from: '/products',
                                  pendingAdd: {
                                    product,
                                    color: currentColorName,
                                    size: product.sizes?.[0] || 'M',
                                    qty: 1
                                  },
                                  reason: 'Please create an account or sign in to add items to your bag.'
                                }
                              })
                              return
                            }
                            addToCart(product, currentColorName)
                          }}
                          disabled={!product.inStock}
                          aria-label={`Quick add ${product.name} to bag`}
                          title={
                            product.inStock
                              ? `Add ${product.name} to bag`
                              : `${product.name} is out of stock`
                          }
                          className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center text-ink shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-fox sm:bottom-4 sm:right-4 sm:h-10 sm:w-10 ${
                            product.inStock
                              ? 'bg-white hover:bg-fox hover:text-white cursor-pointer'
                              : 'cursor-not-allowed bg-white/70 text-soft'
                          }`}
                        >
                          <Plus size={18} strokeWidth={1.8} />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="mt-3.5 flex flex-col gap-1 sm:mt-4">
                        <Link
                          to={`/products/${product.id}`}
                          className="w-fit text-[12px] font-semibold leading-snug text-ink transition-colors hover:text-fox-deep sm:text-[14px]"
                        >
                          {product.name}
                        </Link>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[12px] font-semibold text-ink sm:text-[14px]">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[11px] font-normal text-soft line-through sm:text-[12px]">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Color Options */}
                      {product.colors && product.colors.length > 0 && (
                        <div
                          className="mt-3 flex items-center gap-1.5"
                          aria-label={`Available colours for ${product.name}`}
                        >
                          {product.colors.map((c) => (
                            <button
                              type="button"
                              key={c.name}
                              aria-label={`${product.name} in ${c.name}`}
                              aria-pressed={currentColorName === c.name}
                              title={c.name}
                              onClick={() =>
                                setSelectedProductColors((prev) => ({
                                  ...prev,
                                  [product.id]: c.name,
                                }))
                              }
                              className={`relative flex h-[18px] w-[18px] items-center justify-center rounded-full border transition-colors hover:border-ink sm:h-5 sm:w-5 before:absolute before:-inset-2 before:content-[''] touch-manipulation ${
                                currentColorName === c.name
                                  ? 'border-fox ring-1 ring-fox/40'
                                  : 'border-transparent'
                              }`}
                            >
                              <span
                                className="h-3 w-3 rounded-full border border-black/10 sm:h-3.5 sm:w-3.5"
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

              {/* Progressive Loading / Load More */}
              {visibleCount < sortedProducts.length && (
                <div className="mt-12 flex flex-col items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="inline-flex items-center justify-center bg-ink px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-fox hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fox active:scale-[0.98]"
                  >
                    Load More Products ({sortedProducts.length - visibleProducts.length} Remaining)
                  </button>
                  <p className="text-xs text-soft">
                    Showing {visibleProducts.length} of {sortedProducts.length} products
                  </p>
                </div>
              )}
            </>
          ) : searchQuery.trim() ? (
            /* 5. SEARCH MISS EMPTY STATE */
            <EmptyState
              heading={`NO PIECES MATCH "${searchQuery}"`}
              message="We couldn't find any clothing matching your search query. Check for typos, try our suggestions below, or explore our curated categories."
              primaryAction={{
                label: 'CLEAR SEARCH',
                onClick: () => {
                  const newParams = new URLSearchParams(searchParams)
                  newParams.delete('search')
                  newParams.delete('q')
                  setSearchParams(newParams, { replace: true })
                },
              }}
              secondaryAction={{
                label: 'CLEAR ALL FILTERS',
                onClick: resetAll,
              }}
              suggestions={
                <div className="space-y-4">
                  {findTypoSuggestions(searchQuery).length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-xs text-soft font-medium">Did you mean:</span>
                      {findTypoSuggestions(searchQuery).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            const newParams = new URLSearchParams(searchParams)
                            newParams.set('search', suggestion)
                            setSearchParams(newParams, { replace: true })
                          }}
                          className="rounded-full border border-fox/40 bg-sand px-3 py-1 text-xs font-semibold text-ink hover:border-fox hover:text-fox transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-soft mb-2.5">
                      Explore by Category
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            const newParams = new URLSearchParams(searchParams)
                            newParams.delete('search')
                            newParams.delete('q')
                            newParams.set('category', cat)
                            setSearchParams(newParams, { replace: true })
                          }}
                          className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink hover:border-fox hover:text-fox transition-colors"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              }
            />
          ) : (
            /* 5. HELPFUL FILTER MISS EMPTY STATE */
            <EmptyState
              icon={<SlidersHorizontal size={24} />}
              heading="NO MATCHING PIECES FOUND"
              message="We couldn't find any clothing matching your active filters. Try broadening your criteria or clearing filters to see the full collection."
              primaryAction={{
                label: 'CLEAR ALL FILTERS',
                onClick: resetAll,
              }}
            />
          )}
        </section>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {mobileDrawerOpen && (
        <div
          className="shop-drawer-overlay md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
        >
          <div
            className="shop-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-base font-extrabold uppercase text-ink">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 text-ink hover:text-fox"
                aria-label="Close filter drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Filter Sections */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink mb-3">
                  Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_ITEMS.map((cat) => {
                    const isSelected = activeCategory === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategorySelect(cat)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                          isSelected
                            ? 'bg-ink text-white'
                            : 'border border-line bg-paper text-ink hover:border-ink'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Size Filter */}
              <div className="border-t border-line pt-5">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink mb-3">
                  Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((size) => {
                    const isSelected = selectedSizes.includes(size)
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`flex h-10 w-12 items-center justify-center border text-xs font-bold transition-colors ${
                          isSelected
                            ? 'border-ink bg-ink text-white'
                            : 'border-line text-ink hover:border-ink'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Color Filter */}
              <div className="border-t border-line pt-5">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink mb-3">
                  Color
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {availableColors.map((col) => {
                    const isSelected = selectedColors.includes(col.name)
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => toggleColor(col.name)}
                        className={`flex items-center gap-2 rounded border px-3 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? 'border-ink bg-sand font-bold text-ink'
                            : 'border-line hover:border-ink'
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: col.value }}
                        />
                        <span className="truncate">{col.name}</span>
                        {isSelected && (
                          <Check size={14} className="ml-auto text-fox shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Price Filter */}
              <div className="border-t border-line pt-5">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink mb-3">
                  Price
                </h3>
                <div className="flex flex-col gap-2">
                  {PRICE_RANGES.map((rng) => {
                    const isSelected = selectedPriceRange === rng.id
                    return (
                      <button
                        key={rng.id}
                        type="button"
                        onClick={() => setSelectedPriceRange(rng.id)}
                        className={`flex items-center justify-between rounded border px-3.5 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? 'border-ink bg-sand font-bold text-ink'
                            : 'border-line text-soft hover:border-ink hover:text-ink'
                        }`}
                      >
                        <span>{rng.label}</span>
                        {isSelected && <Check size={14} className="text-fox" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="border-t border-line pt-5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                    In Stock Only
                  </span>
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="h-4 w-4 rounded border-line text-fox focus:ring-fox"
                  />
                </label>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t border-line p-4 flex gap-3 bg-paper">
              <button
                type="button"
                onClick={resetAll}
                className="flex-1 py-3 border border-line text-xs font-bold uppercase tracking-wider text-ink transition-colors hover:border-ink"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-[2] py-3 bg-ink text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-fox"
              >
                Show {filteredProducts.length} Results
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
