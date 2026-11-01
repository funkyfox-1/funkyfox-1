import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Shirt,
  Gem,
  Truck,
  Heart,
} from 'lucide-react'
import Footer from './Footer'
import './AboutPage.css'

export default function AboutPage() {
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="about-ref-page bg-[#F7F3EA] text-[#191919] min-h-screen flex flex-col justify-between selection:bg-[#E87535] selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="about-ref-hero relative overflow-hidden pt-24 pb-8 sm:pt-28 sm:pb-12 lg:pt-32 lg:pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-y-6 lg:grid-cols-12 lg:gap-x-10">
            {/* Left Column: Typography & Story */}
            <div className="lg:col-span-6 flex flex-col items-start z-10 lg:pr-2">
              {/* Eyebrow */}
              <div className="flex items-center gap-2">
                <span className="h-[2.5px] w-5 rounded-full bg-[#E87535]" aria-hidden="true" />
                <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#191919]">
                  ABOUT FUNKY FOX
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="about-ref-headline mt-3 font-display font-black uppercase text-[#191919] tracking-[-0.035em] leading-[0.93] text-4xl sm:text-5xl lg:text-[3.8rem] xl:text-[4.2rem]">
                MORE THAN<br />
                JUST CLOTHES.
              </h1>

              {/* Supporting Copy */}
              <p className="mt-4 max-w-[40ch] text-xs sm:text-[13px] leading-relaxed text-[#737373]">
                FUNKY FOX is where fashion meets attitude.<br />
                We’re not just a clothing brand — we’re a lifestyle.<br />
                A community of dreamers, doers and style enthusiasts<br />
                who believe in expressing themselves.
              </p>

              {/* CTA Button */}
              <div className="mt-6">
                <a
                  href="#mission"
                  className="about-ref-btn-black inline-flex items-center gap-2 rounded-full bg-[#191919] px-5 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white shadow-xs transition-all hover:bg-[#333333] hover:gap-3"
                >
                  <span>OUR STORY</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>

            {/* Right Column: Hero Art Composition with Model, Green Panel & "Wear Your Attitude" */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[480px]">
                <img
                  src="/images/about/hero-art-full@2x.png"
                  alt="FUNKY FOX model in black t-shirt and sunglasses with 'Wear Your Attitude' annotation"
                  className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-2xs"
                  width="630"
                  height="500"
                  fetchPriority="high"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/images/about/hero-art-full.png'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BRAND STATISTICS STRIP */}
      <section className="about-ref-stats-section py-2 relative z-20" aria-label="Brand Statistics">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="about-ref-stats-bar rounded-xl sm:rounded-2xl border border-[#E7E1D7] bg-[#FAF6ED] shadow-2xs py-3.5 sm:py-4 px-3 sm:px-6">
            <div className="grid grid-cols-2 gap-y-3 md:grid-cols-4 md:gap-y-0 text-center">
              {/* Stat 1 */}
              <div className="about-ref-stat-col relative border-r border-[#E7E1D7] pr-2 last:border-r-0 md:pr-0">
                <div className="relative inline-block">
                  <span className="font-display text-xl sm:text-2xl font-black text-[#191919] tracking-tight">
                    150+
                  </span>
                  {/* Decorative faint pencil loop */}
                  <svg
                    className="absolute -left-2 -top-1 w-14 h-8 pointer-events-none text-[#191919]/25"
                    viewBox="0 0 50 30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                  >
                    <path d="M 5,22 C 15,28 35,26 45,15 C 48,10 40,4 30,8 C 18,12 8,24 20,27 C 32,29 45,22 48,18" />
                  </svg>
                </div>
                <p className="mt-0.5 text-[10.5px] sm:text-xs font-medium text-[#737373]">
                  Products
                </p>
              </div>

              {/* Stat 2 */}
              <div className="about-ref-stat-col md:border-r border-[#E7E1D7] pr-2 last:border-r-0 md:pr-0">
                <span className="font-display text-xl sm:text-2xl font-black text-[#191919] tracking-tight">
                  10K+
                </span>
                <p className="mt-0.5 text-[10.5px] sm:text-xs font-medium text-[#737373]">
                  Happy Customers
                </p>
              </div>

              {/* Stat 3 */}
              <div className="about-ref-stat-col border-r border-[#E7E1D7] pr-2 last:border-r-0 md:pr-0">
                <span className="font-display text-xl sm:text-2xl font-black text-[#191919] tracking-tight">
                  4.8 ★
                </span>
                <p className="mt-0.5 text-[10.5px] sm:text-xs font-medium text-[#737373]">
                  Average Rating
                </p>
              </div>

              {/* Stat 4 */}
              <div className="about-ref-stat-col">
                <span className="font-display text-xl sm:text-2xl font-black text-[#191919] tracking-tight">
                  Pan India
                </span>
                <p className="mt-0.5 text-[10.5px] sm:text-xs font-medium text-[#737373]">
                  Delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR MISSION SECTION */}
      <section id="mission" className="about-ref-mission scroll-mt-24 py-8 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-y-6 lg:grid-cols-12 lg:gap-x-12">
            {/* Left: Polaroid-framed Clothes Rack Photo */}
            <div className="lg:col-span-6 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-[430px]">
                <img
                  src="/images/about/mission-rack-framed@2x.png"
                  alt="FUNKY FOX clothes rack collection with masking tape and doodle crown"
                  className="w-full h-auto object-contain select-none"
                  width="540"
                  height="390"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/images/about/mission-rack-framed.png'
                  }}
                />
              </div>
            </div>

            {/* Right: Mission Statement */}
            <div className="lg:col-span-6 flex flex-col items-start lg:pl-2">
              <div className="flex items-center gap-2">
                <span className="h-[2.5px] w-5 rounded-full bg-[#E87535]" aria-hidden="true" />
                <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#191919]">
                  OUR MISSION
                </span>
              </div>

              <h2 className="mt-3 font-display text-2xl sm:text-3xl lg:text-[2.45rem] font-black text-[#191919] tracking-[-0.03em] leading-[1.08]">
                To make everyday<br />
                fashion effortless.
              </h2>

              <p className="mt-3.5 max-w-[42ch] text-xs sm:text-[13px] leading-relaxed text-[#737373]">
                We believe great style should be simple, accessible,
                and comfortable. That’s why we’re here — to bring you
                high-quality men’s fashion that fits your lifestyle.
              </p>

              <div className="mt-5">
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#191919] border-b-[1.5px] border-[#191919] pb-0.5 hover:text-[#E87535] hover:border-[#E87535] transition-colors"
                >
                  <span>EXPLORE OUR STORY</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR VALUES SECTION */}
      <section className="about-ref-values relative py-8 sm:py-10 lg:py-12 overflow-hidden">
        {/* Faint oversized globe watermark on far right */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-4%] top-[5%] w-[340px] h-[340px] rounded-full opacity-35 hidden md:block select-none"
        >
          <svg
            className="w-full h-full text-[#191919]/15"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
          >
            <circle cx="50" cy="50" r="45" />
            <ellipse cx="50" cy="50" rx="45" ry="18" />
            <ellipse cx="50" cy="50" rx="18" ry="45" />
            <line x1="5" y1="50" x2="95" y2="50" />
            <line x1="50" y1="5" x2="50" y2="95" />
          </svg>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col items-start relative">
            <div className="flex items-center gap-2">
              <span className="h-[2.5px] w-5 rounded-full bg-[#E87535]" aria-hidden="true" />
              <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#191919]">
                OUR VALUES
              </span>
            </div>

            {/* Sparkle star top right of heading */}
            <span
              aria-hidden="true"
              className="absolute right-6 sm:right-24 top-1 text-[#191919] text-lg select-none"
            >
              ✦
            </span>

            <h2 className="mt-2.5 font-display text-2xl sm:text-3xl lg:text-[2.45rem] font-black text-[#191919] tracking-tight">
              Style. Confidence. You.
            </h2>
            <p className="mt-1.5 text-xs sm:text-[13px] text-[#737373]">
              More than just fashion — it's a mindset. Here's what drives us.
            </p>
          </div>

          {/* 4 Equal Cards in a single desktop row */}
          <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {/* Card 1: Trendy Styles */}
            <div className="about-ref-value-card rounded-xl sm:rounded-2xl border border-[#E7E1D7] bg-[#FAF6ED] p-5 flex flex-col justify-between transition-all hover:bg-white hover:border-[#191919]/30 hover:shadow-2xs">
              <div>
                <div className="flex h-9 w-9 items-center justify-center text-[#E87535]">
                  <Shirt size={22} strokeWidth={1.8} />
                </div>
                <h3 className="mt-3 font-display text-xs sm:text-[13.5px] font-bold text-[#191919] tracking-wide">
                  Trendy Styles
                </h3>
                <p className="mt-1 text-[11px] sm:text-xs text-[#737373] leading-relaxed">
                  Stay ahead with the latest trends.
                </p>
              </div>
            </div>

            {/* Card 2: Premium Quality */}
            <div className="about-ref-value-card rounded-xl sm:rounded-2xl border border-[#E7E1D7] bg-[#FAF6ED] p-5 flex flex-col justify-between transition-all hover:bg-white hover:border-[#191919]/30 hover:shadow-2xs">
              <div>
                <div className="flex h-9 w-9 items-center justify-center text-[#E87535]">
                  <Gem size={22} strokeWidth={1.8} />
                </div>
                <h3 className="mt-3 font-display text-xs sm:text-[13.5px] font-bold text-[#191919] tracking-wide">
                  Premium Quality
                </h3>
                <p className="mt-1 text-[11px] sm:text-xs text-[#737373] leading-relaxed">
                  Wear better, feel better.
                </p>
              </div>
            </div>

            {/* Card 3: Nationwide Delivery */}
            <div className="about-ref-value-card rounded-xl sm:rounded-2xl border border-[#E7E1D7] bg-[#FAF6ED] p-5 flex flex-col justify-between transition-all hover:bg-white hover:border-[#191919]/30 hover:shadow-2xs">
              <div>
                <div className="flex h-9 w-9 items-center justify-center text-[#E87535]">
                  <Truck size={22} strokeWidth={1.8} />
                </div>
                <h3 className="mt-3 font-display text-xs sm:text-[13.5px] font-bold text-[#191919] tracking-wide">
                  Nationwide Delivery
                </h3>
                <p className="mt-1 text-[11px] sm:text-xs text-[#737373] leading-relaxed">
                  Fashion, delivered to you.
                </p>
              </div>
            </div>

            {/* Card 4: Customer First */}
            <div className="about-ref-value-card rounded-xl sm:rounded-2xl border border-[#E7E1D7] bg-[#FAF6ED] p-5 flex flex-col justify-between transition-all hover:bg-white hover:border-[#191919]/30 hover:shadow-2xs">
              <div>
                <div className="flex h-9 w-9 items-center justify-center text-[#E87535]">
                  <Heart size={22} strokeWidth={1.8} />
                </div>
                <h3 className="mt-3 font-display text-xs sm:text-[13.5px] font-bold text-[#191919] tracking-wide">
                  Customer First
                </h3>
                <p className="mt-1 text-[11px] sm:text-xs text-[#737373] leading-relaxed">
                  We’re here to help.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. OUR JOURNEY SECTION */}
      <section className="about-ref-journey py-8 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-y-6 lg:grid-cols-12 lg:gap-x-12">
            {/* Left: 3-Photo Layered Collage */}
            <div className="lg:col-span-6 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-[450px]">
                <img
                  src="/images/about/journey-collage-framed@2x.png"
                  alt="FUNKY FOX journey collage with hoodie, woven label, and streetwear"
                  className="w-full h-auto object-contain select-none"
                  width="530"
                  height="340"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/images/about/journey-collage-framed.png'
                  }}
                />
              </div>
            </div>

            {/* Right: Journey Text & CTA */}
            <div className="lg:col-span-6 flex flex-col items-start lg:pl-2">
              <div className="flex items-center gap-2">
                <span className="h-[2.5px] w-5 rounded-full bg-[#E87535]" aria-hidden="true" />
                <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#191919]">
                  OUR JOURNEY
                </span>
              </div>

              <h2 className="mt-3 font-display text-2xl sm:text-3xl lg:text-[2.45rem] font-black text-[#191919] tracking-[-0.03em] leading-[1.08]">
                Born from a simple idea —<br />
                that style should feel good.
              </h2>

              <p className="mt-3.5 max-w-[42ch] text-xs sm:text-[13px] leading-relaxed text-[#737373]">
                FUNKY FOX started with a passion for fashion and a belief
                that everyday clothing can be extraordinary. We design for the
                modern man who values comfort, confidence and individuality.
              </p>

              <div className="mt-6">
                <Link
                  to="/products"
                  className="about-ref-btn-black inline-flex items-center gap-2 rounded-full bg-[#191919] px-5 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white shadow-xs transition-all hover:bg-[#333333] hover:gap-3"
                >
                  <span>JOIN THE MOVEMENT</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GLOBAL FOOTER (Unified Pushpin Tear Footer) */}
      <Footer />
    </div>
  )
}
