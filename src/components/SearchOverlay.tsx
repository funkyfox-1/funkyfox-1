import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, Sparkles } from 'lucide-react'
import { products, formatPrice, categories, getCategoryFallbackImage, type Product } from '../data/products'
import { matchesProductSearch, findTypoSuggestions } from '../utils/search'
import './SearchOverlay.css'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Lock body scroll when search is open
  React.useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])

  // Auto-focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setQuery('')
    }
  }, [isOpen])

  // Escape key closes search
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Filter products based on query using shared search normalizer
  const searchResults = React.useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return []

    return products.filter((product) => matchesProductSearch(product, trimmed))
  }, [query])

  // Featured "Popular right now" products for discovery state
  const popularProducts = React.useMemo(() => {
    return products.slice(0, 4)
  }, [])

  // Handle Enter key in input
  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = query.trim()
      if (trimmed) {
        onClose()
        if (searchResults.length === 1) {
          navigate(`/products/${searchResults[0].id}`)
        } else {
          navigate(`/products?search=${encodeURIComponent(trimmed)}`)
        }
      }
    }
  }

  // Clear query
  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  // Navigate to category
  const handleCategoryClick = (cat: string) => {
    onClose()
    navigate(`/products?category=${encodeURIComponent(cat)}`)
  }

  // Navigate to product
  const handleProductClick = (productId: string) => {
    onClose()
    navigate(`/products/${productId}`)
  }

  if (!isOpen) return null

  const isQueryEmpty = query.trim() === ''
  const hasMatches = searchResults.length > 0

  return (
    <div
      className="search-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="search-modal">
        {/* Search Bar Header */}
        <div className="search-bar-wrap">
          <div className="search-input-container">
            <Search size={20} className="search-input-icon" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDownInput}
              placeholder="Search for your style..."
              aria-label="Search products"
              className="search-text-input"
              autoComplete="off"
              spellCheck="false"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search query"
                className="search-clear-btn"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="search-close-btn"
          >
            <span>Close</span>
            <X size={16} />
          </button>
        </div>

        {/* Search Body Content */}
        <div className="search-body">
          {/* STATE 1: Empty Query / Discovery State */}
          {isQueryEmpty && (
            <div>
              {/* Quick Category Suggestions */}
              <div>
                <h2 className="font-display text-lg font-black uppercase tracking-tight text-ink sm:text-xl">
                  WHAT ARE YOU LOOKING FOR?
                </h2>

                <div className="search-categories-row" role="list">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryClick(category)}
                      className="search-category-chip"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Right Now Section */}
              <div className="mt-8 border-t border-line pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-fox" />
                    <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-ink">
                      Popular right now
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      navigate('/products')
                    }}
                    className="text-xs font-bold uppercase tracking-wider text-soft hover:text-fox transition-colors underline underline-offset-4"
                  >
                    View all
                  </button>
                </div>

                <div className="search-results-grid">
                  {popularProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleProductClick(product.id)}
                      className="search-product-card"
                    >
                      <div className="search-product-img-wrap">
                        <img
                          src={product.image}
                          alt={product.alt}
                          className="search-product-img"
                          loading="lazy"
                          width="240"
                          height="320"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = getCategoryFallbackImage(product.category)
                          }}
                        />
                      </div>
                      <div className="search-product-info">
                        <span className="search-product-category">
                          {product.category}
                        </span>
                        <h4 className="search-product-title">
                          {product.name}
                        </h4>
                        <span className="search-product-price">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Matching Results */}
          {!isQueryEmpty && hasMatches && (
            <div>
              <div className="flex items-baseline justify-between mb-4 border-b border-line pb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-soft">
                  <span className="text-fox font-extrabold">{searchResults.length}</span>{' '}
                  {searchResults.length === 1 ? 'item found' : 'items found'} for &ldquo;{query}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    navigate(`/products?search=${encodeURIComponent(query.trim())}`)
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-ink hover:text-fox transition-colors"
                >
                  <span>View all in shop</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="search-results-grid">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductClick(product.id)}
                    className="search-product-card"
                  >
                    <div className="search-product-img-wrap">
                      <img
                        src={product.image}
                        alt={product.alt}
                        className="search-product-img"
                        loading="lazy"
                        width="240"
                        height="320"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = getCategoryFallbackImage(product.category)
                        }}
                      />
                    </div>
                    <div className="search-product-info">
                      <span className="search-product-category">
                        {product.category}
                      </span>
                      <h4 className="search-product-title">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-soft mt-0.5">
                        {product.colors.length} {product.colors.length === 1 ? 'colour' : 'colours'}
                      </p>
                      <span className="search-product-price">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STATE 3: No Matching Results */}
          {!isQueryEmpty && !hasMatches && (
            <div className="search-no-matches">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sand text-soft">
                <Search size={28} strokeWidth={1.5} />
              </div>

              <h3 className="search-no-matches-heading">
                NO MATCHES FOR &ldquo;{query}&rdquo;
              </h3>

              <p className="search-no-matches-text">
                We couldn&rsquo;t find any items matching your exact query. Check for typos or explore our suggestions.
              </p>

              {/* Typo suggestions if available */}
              {findTypoSuggestions(query).length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs text-soft">Did you mean:</span>
                  {findTypoSuggestions(query).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setQuery(sug)}
                      className="rounded-full border border-fox/40 bg-sand px-3 py-1 text-xs font-semibold text-ink hover:border-fox hover:text-fox transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    inputRef.current?.focus()
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-line bg-paper px-5 text-xs font-bold uppercase tracking-wider text-ink hover:border-ink hover:bg-sand transition-colors"
                >
                  Clear Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    navigate('/products')
                  }}
                  className="search-explore-all-btn"
                >
                  <span>Explore Collection</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-line w-full max-w-md">
                <p className="text-[11px] font-bold uppercase tracking-wider text-soft text-center mb-3">
                  Or explore by category
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryClick(category)}
                      className="search-category-chip"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

