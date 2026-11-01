import * as React from 'react'
import { Link } from 'react-router-dom'
import './TrendingCategories.css'

interface TrendingCategory {
  id: string
  name: string
  image: string
  link: string
}

const TRENDING_CATEGORIES: TrendingCategory[] = [
  {
    id: 'clothing',
    name: 'Clothing',
    image: '/images/trending/clothing.png',
    link: '/products',
  },
  {
    id: 'tops',
    name: 'Tops',
    image: '/images/trending/tops.png',
    link: '/products?category=T-Shirts',
  },
  {
    id: 'sweaters',
    name: 'Sweaters',
    image: '/images/trending/sweaters.png',
    link: '/products?category=Shirts',
  },
  {
    id: 'dresses',
    name: 'Dresses',
    image: '/images/trending/dresses.png',
    link: '/products',
  },
  {
    id: 'bottoms',
    name: 'Bottoms',
    image: '/images/trending/bottoms.png',
    link: '/products?category=Trousers%20%26%20Jeans',
  },
  {
    id: 'stocks',
    name: 'Stocks',
    image: '/images/trending/stocks.png',
    link: '/products?category=Jackets',
  },
]

export default function TrendingCategories() {
  return (
    <section id="trending-categories" className="scroll-mt-20 py-14 sm:py-16 bg-white border-t border-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Simple clean header with zero overwhelm */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Trending Right Now
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-neutral-400">
            Top categories on this week
          </p>
        </div>

        {/* Clean, simple horizontal row of circular categories */}
        <div className="trending-categories-scroll">
          <div className="trending-categories-grid">
            {TRENDING_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={cat.link}
                className="group flex flex-col items-center text-center transition-transform hover:-translate-y-1"
                aria-label={`Browse ${cat.name}`}
              >
                {/* Clean round circle image */}
                <div className="trending-circle-wrapper">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {/* Category Name Only */}
                <span className="mt-3.5 text-sm font-semibold text-neutral-900 group-hover:text-fox transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

