import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import './EverydayLineup.css'

interface LineupCategory {
  num: string
  title: string
  image: string
  link: string
  featured?: boolean
}

const LINEUP_ITEMS: LineupCategory[] = [
  {
    num: '01',
    title: 'ESSENTIALS',
    image: '/images/category-essentials.jpg',
    link: '/products?category=Essentials',
    featured: true,
  },
  {
    num: '02',
    title: 'T-SHIRTS',
    image: '/images/category-tshirts.jpg',
    link: '/products?category=T-Shirts',
  },
  {
    num: '03',
    title: 'SHIRTS',
    image: '/images/category-shirts.jpg',
    link: '/products?category=Shirts',
  },
  {
    num: '04',
    title: 'TROUSERS & JEANS',
    image: '/images/category-trousers.jpg',
    link: '/products?category=Trousers%20%26%20Jeans',
  },
  {
    num: '05',
    title: 'JACKETS',
    image: '/images/category-jackets.jpg',
    link: '/products?category=Jackets',
  },
]

export default function EverydayLineup() {
  return (
    <section
      id="categories"
      aria-labelledby="lineup-heading"
      className="everyday-lineup-section scroll-mt-24 bg-white py-14 sm:py-16 lg:py-20 border-t border-line"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header matching designer reference */}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="everyday-lineup-dash" aria-hidden="true" />
              <p className="everyday-lineup-eyebrow">
                FIND YOUR STYLE
              </p>
            </div>
            <h2
              id="lineup-heading"
              className="mt-2.5 font-display text-3xl font-black uppercase leading-[.95] tracking-[-.03em] text-ink sm:text-4xl lg:text-[2.75rem]"
            >
              THE EVERYDAY LINEUP.
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 sm:text-[14px]">
              The pieces you’ll keep reaching for.
            </p>
          </div>
          <Link
            to="/products"
            className="group mb-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.18em] text-ink transition-colors hover:text-fox"
          >
            VIEW ALL CATEGORIES
            <ArrowRight
              size={13}
              strokeWidth={2.5}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* 5 Category Cards matching reference screenshot */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {LINEUP_ITEMS.map((item) => (
            <Link
              key={item.num}
              to={item.link}
              className="everyday-lineup-card group"
              aria-label={`Browse ${item.title}`}
            >
              <div className="everyday-lineup-img-wrap">
                <img
                  src={item.image}
                  alt={item.title}
                  className="everyday-lineup-img"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/images/hero-model.jpg'
                  }}
                />
                {/* Top Corner Index */}
                <span className="everyday-lineup-badge" aria-hidden="true">
                  {item.num}
                </span>

                {/* Bottom Shadow Gradient */}
                <div className="everyday-lineup-gradient" />

                {/* Bottom Row: Title + Arrow Action Button */}
                <div className="everyday-lineup-footer">
                  <span className="everyday-lineup-title">
                    {item.title}
                  </span>
                  <div
                    className={`everyday-lineup-arrow ${
                      item.featured ? 'everyday-lineup-arrow--featured' : ''
                    }`}
                  >
                    <ArrowRight size={16} strokeWidth={2.4} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

