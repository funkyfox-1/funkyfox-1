import * as React from 'react'
import './ShoppingProcess.css'

export default function ShoppingProcess() {
  const steps = [
    {
      num: '01',
      title: 'Check what you like',
      description:
        'Explore our everyday essentials — heavyweight tees, breathable shirts, relaxed trousers, and versatile layers designed for real life.',
      illustration: (
        <svg
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="fox-process-svg"
          aria-hidden="true"
        >
          {/* Hand holding smartphone sketch matching reference */}
          <rect
            x="44"
            y="22"
            width="72"
            height="116"
            rx="14"
            stroke="#1c1917"
            strokeWidth="2.2"
            fill="#ffffff"
          />
          {/* Speaker pill */}
          <line
            x1="70"
            y1="30"
            x2="90"
            y2="30"
            stroke="#1c1917"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* T-Shirt sketch on screen */}
          <path
            d="M60 48 L70 44 C74 48 86 48 90 44 L100 48 L96 58 L90 56 L90 84 L70 84 L70 56 L64 58 Z"
            stroke="#1c1917"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="#FAF9F6"
          />
          {/* Trousers sketch */}
          <path
            d="M66 90 L94 90 L91 114 L82 114 L80 97 L78 114 L69 114 Z"
            stroke="#1c1917"
            strokeWidth="1.8"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Checkmark circle badge like in reference */}
          <circle cx="104" cy="114" r="12" stroke="#1c1917" strokeWidth="2" fill="#ffffff" />
          <path
            d="M99 114 L103 118 L109 110"
            stroke="#1c1917"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Gentle hand sketch fingers on left */}
          <path
            d="M36 86 C36 80 44 80 44 86"
            stroke="#1c1917"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M34 98 C34 92 44 92 44 98"
            stroke="#1c1917"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M36 110 C36 104 44 104 44 110"
            stroke="#1c1917"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Place your order at low prices',
      description:
        'Enjoy direct-from-maker prices with zero middleman markup. 1-click checkout with secure UPI, Cards, or Cash on Delivery.',
      illustration: (
        <svg
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="fox-process-svg"
          aria-hidden="true"
        >
          {/* Top folded shirt collar */}
          <path
            d="M50 44 C64 38 96 38 110 44 L124 54 C118 60 112 62 98 62 L62 62 C48 62 42 60 36 54 Z"
            stroke="#1c1917"
            strokeWidth="2.2"
            strokeLinejoin="round"
            fill="#ffffff"
          />
          <path
            d="M74 44 L80 52 L86 44"
            stroke="#1c1917"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Middle folded sweater layer */}
          <path
            d="M34 64 C34 60 42 58 56 58 H104 C118 58 126 60 126 64 C126 72 118 76 104 76 H56 C42 76 34 72 34 64 Z"
            stroke="#1c1917"
            strokeWidth="2.2"
            strokeLinejoin="round"
            fill="#FAF9F6"
          />
          {/* Bottom folded denim/chinos layer */}
          <path
            d="M36 78 C36 74 44 72 58 72 H102 C116 72 124 74 124 78 C124 86 116 90 102 90 H58 C44 90 36 86 36 78 Z"
            stroke="#1c1917"
            strokeWidth="2.2"
            strokeLinejoin="round"
            fill="#ffffff"
          />
          {/* Supporting hand cradle sketch */}
          <path
            d="M44 95 C52 101 72 105 92 105 C110 105 122 101 128 94"
            stroke="#1c1917"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M72 101 C72 107 84 107 96 104 L116 100"
            stroke="#1c1917"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <line
            x1="94"
            y1="106"
            x2="94"
            y2="116"
            stroke="#1c1917"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Get it delivered to your home',
      description:
        'Fast doorstep delivery in 3–5 days across 19,000+ pin codes. Complimentary 15-day size exchanges if anything isn’t perfect.',
      illustration: (
        <svg
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="fox-process-svg"
          aria-hidden="true"
        >
          {/* Back bag */}
          <path
            d="M40 46 L76 38 L88 48 L88 116 L52 124 L40 114 Z"
            stroke="#1c1917"
            strokeWidth="2.2"
            strokeLinejoin="round"
            fill="#FAF9F6"
          />
          {/* Back bag looped handle */}
          <path
            d="M52 44 C52 28 68 22 72 38"
            stroke="#1c1917"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Front shopping bag with crisp folds */}
          <path
            d="M68 58 L114 48 L126 56 L126 126 L80 134 L68 126 Z"
            stroke="#1c1917"
            strokeWidth="2.2"
            strokeLinejoin="round"
            fill="#ffffff"
          />
          <line
            x1="80"
            y1="134"
            x2="80"
            y2="66"
            stroke="#1c1917"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line x1="68" y1="58" x2="80" y2="66" stroke="#1c1917" strokeWidth="1.8" />
          <line x1="114" y1="48" x2="80" y2="66" stroke="#1c1917" strokeWidth="1.8" />
          {/* Looped handle */}
          <path
            d="M84 76 C84 96 104 96 104 72"
            stroke="#1c1917"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Subtle ground line */}
          <line
            x1="28"
            y1="136"
            x2="138"
            y2="136"
            stroke="#1c1917"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.2"
          />
        </svg>
      ),
    },
  ]

  return (
    <section
      id="how-it-works"
      className="fox-process-section scroll-mt-20 py-12 sm:py-16 lg:py-20"
      aria-labelledby="process-heading"
    >
      <div className="fox-process-container">
        {/* Simple Centered Heading matching reference image */}
        <div className="fox-process-header">
          <h2
            id="process-heading"
            className="fox-process-title"
          >
            How Funky Fox works
          </h2>
        </div>

        {/* 3 Step Columns */}
        <div className="fox-process-grid">
          {steps.map((item) => (
            <div
              key={item.num}
              className="fox-process-col group"
            >
              {/* Illustration Container */}
              <div className="fox-process-illus-box">
                {item.illustration}
              </div>

              {/* Step Title */}
              <h3 className="fox-process-col-title">
                {item.title}
              </h3>

              {/* Step Description */}
              <p className="fox-process-col-desc">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
