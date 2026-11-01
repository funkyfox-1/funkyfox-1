import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import './CategoryCircles.css'

interface CategoryItem {
  id: string
  name: string
  count: string
  badge: string
  tagline: string
  icon: (props: { className?: string }) => React.ReactNode
}

// Bespoke, minimalist fashion garment icons with precision paths
function TShirtIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Crewneck T-shirt silhouette */}
      <path d="M16 8 C18 12, 30 12, 32 8 L43 14 L37 23 L32 20 L32 40 L16 40 L16 20 L11 23 L5 14 Z" />
      <path d="M19 8 C20 11, 28 11, 29 8" strokeWidth="2" />
      <path d="M11 23 L16 20" strokeWidth="1.8" />
      <path d="M37 23 L32 20" strokeWidth="1.8" />
      <path d="M16 38 L32 38" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  )
}

function ShirtIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Collared button-down shirt silhouette */}
      <path d="M17 7 L24 13 L31 7 L42 13 L37 23 L33 21 L33 41 L15 41 L15 21 L11 23 L6 13 Z" />
      <path d="M17 7 L24 13 L31 7 L24 9 Z" fill="currentColor" fillOpacity="0.08" />
      {/* Placket & buttons */}
      <line x1="24" y1="13" x2="24" y2="41" strokeWidth="1.8" />
      <circle cx="24" cy="18" r="1" fill="currentColor" />
      <circle cx="24" cy="24" r="1" fill="currentColor" />
      <circle cx="24" cy="30" r="1" fill="currentColor" />
      <circle cx="24" cy="36" r="1" fill="currentColor" />
      {/* Pocket */}
      <path d="M28 20 L28 26 C28 27.5, 30.5 27.5, 30.5 26 L30.5 20 Z" strokeWidth="1.5" />
    </svg>
  )
}

function TrousersIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Tailored trousers and jeans silhouette */}
      <path d="M12 9 L36 9 L34 41 L25.5 41 L24 23 L22.5 41 L14 41 Z" />
      <line x1="12" y1="13" x2="36" y2="13" strokeWidth="1.8" />
      {/* Fly & belt loops */}
      <line x1="24" y1="13" x2="24" y2="21" strokeWidth="1.8" />
      <path d="M15 13 L17 18" strokeWidth="1.5" />
      <path d="M33 13 L31 18" strokeWidth="1.5" />
      {/* Cuffs */}
      <line x1="14" y1="38" x2="22.5" y2="38" strokeWidth="1.5" strokeDasharray="2 2" />
      <line x1="25.5" y1="38" x2="34" y2="38" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  )
}

function JacketIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Outerwear & utility jacket silhouette */}
      <path d="M18 8 L24 13 L30 8 L43 14 L38 25 L34 23 L34 41 L14 41 L14 23 L10 25 L5 14 Z" />
      {/* Zipper / front closure */}
      <line x1="24" y1="13" x2="24" y2="41" strokeWidth="2" />
      {/* Lapels */}
      <path d="M18 8 L24 18 L21 21 L16 11 Z" strokeWidth="1.6" />
      <path d="M30 8 L24 18 L27 21 L32 11 Z" strokeWidth="1.6" />
      {/* Flap pockets */}
      <rect x="16" y="27" width="6" height="5" rx="1" strokeWidth="1.5" />
      <rect x="26" y="27" width="6" height="5" rx="1" strokeWidth="1.5" />
    </svg>
  )
}

function AllFitsIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Wardrobe hanger / collection icon */}
      <path d="M24 12 C24 9, 21 8, 20 10 C19 12, 23 14, 24 16 L24 18" />
      <path d="M24 18 L6 27 C5 27.5, 6 29, 7.5 29 L40.5 29 C42 29, 43 27.5, 42 27 Z" />
      <line x1="12" y1="36" x2="36" y2="36" strokeWidth="2" />
      <circle cx="24" cy="36" r="2" fill="currentColor" />
    </svg>
  )
}

const CATEGORY_ITEMS: CategoryItem[] = [
  {
    id: 't-shirts',
    name: 'T-Shirts',
    count: '45 Styles',
    badge: 'Heavyweight & Relaxed',
    tagline: '220 GSM Dense Organic Jersey',
    icon: TShirtIcon,
  },
  {
    id: 'shirts',
    name: 'Shirts',
    count: '40 Styles',
    badge: 'Linen & Poplin',
    tagline: 'Casual Overshirts & Camp Collars',
    icon: ShirtIcon,
  },
  {
    id: 'trousers',
    name: 'Trousers & Jeans',
    count: '35 Styles',
    badge: 'Everyday Bottoms',
    tagline: 'Pleated Chinos & Relaxed Denim',
    icon: TrousersIcon,
  },
  {
    id: 'jackets',
    name: 'Jackets',
    count: '30 Styles',
    badge: 'Smart Outerwear',
    tagline: 'Lightweight Utility & Canvas',
    icon: JacketIcon,
  },
]

export default function CategoryCircles() {
  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="scroll-mt-24 border-t border-line bg-paper py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <p className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[.3em] text-soft sm:text-[10.5px]">
              <span aria-hidden="true" className="h-[3px] w-7 rounded-full bg-fox" />
              Find Your Style
            </p>
            <h2
              id="categories-heading"
              className="mt-3 font-display text-3xl font-black uppercase leading-[.95] tracking-[-.03em] text-ink sm:text-4xl lg:text-[2.75rem]"
            >
              The Everyday Lineup.
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-soft sm:text-[14px]">
              The pieces you’ll keep reaching for — explore by category.
            </p>
          </div>
          <Link
            to="/products"
            className="group mb-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.18em] text-ink transition-colors hover:text-fox"
          >
            View all 150 pieces
            <ArrowRight
              size={13}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Circular Categories Grid matching modern high-end sites */}
        <div className="mt-12 sm:mt-14 lg:mt-16">
          <ul className="fox-categories-grid">
            {CATEGORY_ITEMS.map((cat, idx) => {
              const IconComponent = cat.icon
              return (
                <li key={cat.id} className="flex justify-center">
                  <Link
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="fox-circle-category group flex flex-col items-center text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fox w-full max-w-[200px]"
                    aria-label={`Browse ${cat.name} — ${cat.count}`}
                  >
                    {/* Circle Node with subtle glass depth and crisp icon */}
                    <div className="relative mb-4">
                      {/* Ambient Halo on hover */}
                      <div
                        className="absolute inset-0 rounded-full bg-fox/15 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        aria-hidden="true"
                      />

                      {/* Main Interactive Circle */}
                      <div className="fox-circle-node relative flex h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 items-center justify-center rounded-full border-2 border-line/90 bg-gradient-to-b from-white via-[#FAF8F5] to-sand transition-all duration-300 shadow-sm group-hover:border-fox group-hover:shadow-[0_12px_28px_-6px_rgba(232,117,53,0.25)] group-hover:-translate-y-1.5">
                        {/* Garment Icon */}
                        <div className="text-ink transition-all duration-300 group-hover:text-fox group-hover:scale-110">
                          <IconComponent className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
                        </div>

                        {/* Order index pill badge */}
                        <span
                          className="absolute -bottom-1 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-mono font-bold text-white shadow-sm transition-all duration-300 group-hover:bg-fox group-hover:scale-110"
                          aria-hidden="true"
                        >
                          0{idx + 1}
                        </span>
                      </div>
                    </div>

                    {/* Category Title & Meta */}
                    <div className="flex flex-col items-center">
                      <span className="font-display text-[15px] sm:text-[17px] font-black uppercase tracking-[.04em] text-ink transition-colors group-hover:text-fox-deep">
                        {cat.name}
                      </span>
                      <span className="mt-1 text-[11px] font-semibold text-soft">
                        {cat.count}
                      </span>
                      <span className="mt-1 text-[10px] font-medium text-soft/80 hidden sm:block">
                        {cat.badge}
                      </span>
                      <span className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.18em] text-fox opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5">
                        Shop <ArrowRight size={10} />
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

