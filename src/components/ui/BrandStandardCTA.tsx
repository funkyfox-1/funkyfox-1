import * as React from 'react'
import { Link } from 'react-router-dom'
import './BrandStandardCTA.css'

export default function BrandStandardCTA() {
  return (
    <section className="fox-standard-cta-wrapper py-14 sm:py-18 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6] border-t border-[#E7E7E5]">
      <div className="fox-standard-card mx-auto max-w-7xl">
        <div className="fox-standard-grid">
          {/* Left Column: Brand Story & Statistics */}
          <div className="fox-standard-left">
            {/* Top Orange Accent Dash */}
            <div className="fox-standard-dash" aria-hidden="true" />

            {/* Eyebrow */}
            <p className="fox-standard-eyebrow">
              The Funky Fox Standard
            </p>

            {/* Headline */}
            <h2 className="fox-standard-title">
              Built For<br />The Everyday.
            </h2>

            {/* Editorial Description */}
            <p className="fox-standard-desc">
              We obsess over the details you feel every day — heavier cotton, cleaner cuts, colors that age well. No gimmicks. Just menswear that feels like you, season after season.
            </p>

            {/* 3 Stats (Horizontal Row, No Divider) */}
            <div className="fox-standard-stats">
              <div className="fox-standard-stat-item">
                <p className="fox-standard-stat-num">100%</p>
                <p className="fox-standard-stat-label">Cotton First</p>
              </div>
              <div className="fox-standard-stat-item">
                <p className="fox-standard-stat-num">30 DAY</p>
                <p className="fox-standard-stat-label">Returns</p>
              </div>
              <div className="fox-standard-stat-item">
                <p className="fox-standard-stat-num">EST. 2018</p>
                <p className="fox-standard-stat-label">London</p>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="fox-standard-actions">
              <Link to="/about" className="fox-standard-btn-story">
                Our Story
              </Link>
              <Link to="/about#sustainability" className="fox-standard-btn-sust">
                Sustainability
              </Link>
            </div>
          </div>

          {/* Right Column: Bento Visual Cards (100% as in reference) */}
          <div className="fox-standard-bento">
            {/* Left Tall Card: Model in Denim Shirt & Trousers */}
            <div className="fox-standard-tall-card group">
              <img
                src="/images/standard/cta-model-denim.png"
                alt="Funky Fox model wearing denim shirt and jeans"
                className="fox-standard-img transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/images/standard/model-tall-clean.jpg'
                }}
              />
              <div className="fox-standard-vignette" />
              {/* In Stock Pill Badge */}
              <div className="fox-standard-badge">
                <span className="fox-standard-badge-dot" aria-hidden="true" />
                <span>IN STOCK</span>
              </div>
            </div>

            {/* Right Stacked Column (Top Photo + Bottom Orange Card) */}
            <div className="fox-standard-stacked-col">
              {/* Top Photo: Model in Navy Zip Polo */}
              <div className="fox-standard-watch-card group">
                <img
                  src="/images/standard/cta-model-polo.png"
                  alt="Funky Fox model in navy zip-neck polo shirt"
                  className="fox-standard-img transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = '/images/standard/model-watch-clean.jpg'
                  }}
                />
              </div>

              {/* Bottom Orange Community Card */}
              <div className="fox-standard-orange-card">
                <div>
                  <p className="fox-standard-orange-num">
                    50K+
                  </p>
                  <p className="fox-standard-orange-label">
                    Community Members
                  </p>
                </div>

                {/* Avatar Stack + +2k badge */}
                <div className="fox-standard-avatars-row">
                  <div className="fox-standard-avatars">
                    <img
                      src="/images/standard/avatar-beige.png"
                      alt="Community Member 1"
                      className="fox-standard-avatar"
                      onError={(e) => {
                        e.currentTarget.src = '/images/standard/cta-model-beige.png'
                      }}
                    />
                    <img
                      src="/images/standard/avatar-polo.png"
                      alt="Community Member 2"
                      className="fox-standard-avatar"
                      onError={(e) => {
                        e.currentTarget.src = '/images/standard/cta-model-polo.png'
                      }}
                    />
                    <img
                      src="/images/standard/avatar-denim.png"
                      alt="Community Member 3"
                      className="fox-standard-avatar"
                      onError={(e) => {
                        e.currentTarget.src = '/images/standard/cta-model-denim.png'
                      }}
                    />
                  </div>
                  <span className="fox-standard-avatar-pill">
                    +2k
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
