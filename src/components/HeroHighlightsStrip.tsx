import * as React from 'react'
import './HeroHighlightsStrip.css'

interface TickerItem {
  id: string
  text: string
}

const TICKER_ITEMS: TickerItem[] = [
  { id: '1', text: 'FREE SHIPPING OVER ₹1,499' },
  { id: '2', text: 'MADE FOR EVERYDAY STYLE' },
  { id: '3', text: '30-DAY RETURNS' },
  { id: '4', text: 'CUT FOR REAL LIFE' },
  { id: '5', text: 'NEW SEASON' },
]

export default function HeroHighlightsStrip() {
  const [isPaused, setIsPaused] = React.useState(false)

  // Duplicate items 6 times to ensure seamless infinite looping on any screen width
  const loopItems = React.useMemo(() => [
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
    ...TICKER_ITEMS,
  ], [])

  return (
    <div
      className="fox-ticker-tape"
      role="region"
      aria-label="Store highlights announcement ticker"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="fox-ticker-tape__container">
        <div
          className={`fox-ticker-tape__track ${isPaused ? 'fox-ticker-tape__track--paused' : ''}`}
        >
          {loopItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="fox-ticker-tape__item">
              <span className="fox-ticker-tape__diamond" aria-hidden="true">
                <svg viewBox="0 0 10 10" width="8" height="8" fill="currentColor">
                  <polygon points="5,0 10,5 5,10 0,5" />
                </svg>
              </span>
              <span className="fox-ticker-tape__text">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
