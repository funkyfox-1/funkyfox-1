import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
  RotateCcw,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Layers,
  Award,
} from 'lucide-react';
import Footer from './Footer';
import './ui/TactileOrderButton.css';
import './AboutPage.css';

export default function AboutPage() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page bg-[#FAF9F6] text-[#141414] min-h-screen flex flex-col justify-between selection:bg-[#E87535] selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24 border-b border-[#E8E5DF] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Mission & Narrative */}
            <div className="lg:col-span-7 flex flex-col items-start z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E5DF] text-[#E87535] text-[11px] font-bold uppercase tracking-[0.2em] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#E87535]" />
                <span>About Funky Fox · Everyday Menswear</span>
              </div>

              <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#141414] leading-[1.02]">
                We Don’t Do Complicated.<br />
                <span className="text-[#E87535]">We Make Better Basics.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm sm:text-base text-neutral-600 leading-relaxed">
                Funky Fox was founded with one clear obsession: to engineer the ultimate everyday wardrobe for Indian men.
                No flimsy 140 GSM fabrics that twist after two washes. No bacon-neck collars. Just custom-knitted 220 GSM heavyweight combed organic cotton, designed to look sharp, feel comfortable, and last for years.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/products"
                  className="tactile-order-btn text-xs py-3 px-8 shadow-xs"
                >
                  <span>Explore the Collection</span>
                  <ArrowRight size={14} />
                </Link>

                <a
                  href="#standards"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-ink border-b border-neutral-300 pb-0.5 hover:border-ink transition-all"
                >
                  <span>Our Craftsmanship Standards</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>

            {/* Right Column: High-Res Editorial Photography */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#E8E5DF] bg-white aspect-[4/5]">
                  <img
                    src="/images/editorial-campaign.webp"
                    alt="Funky Fox everyday menswear editorial campaign"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/hero-model.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Authenticity Badge */}
                  <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 shadow-lg text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-ink uppercase tracking-wider text-xs">
                        220 GSM Heavyweight Cotton
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold">
                        Pre-Shrunk
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                      Bio-silicon pre-washed for zero shrinkage and dense structured drape.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BRAND STATS STRIP */}
      <section className="py-8 bg-white border-b border-[#E8E5DF]" aria-label="Brand Milestones">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 border-r border-[#E8E5DF] last:border-r-0 md:last:border-r-0">
              <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-ink">
                19,000+
              </span>
              <p className="mt-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                PIN Codes Delivered
              </p>
            </div>
            <div className="p-4 md:border-r border-[#E8E5DF]">
              <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-ink">
                220 GSM
              </span>
              <p className="mt-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Heavyweight Standard
              </p>
            </div>
            <div className="p-4 border-r border-[#E8E5DF] last:border-r-0 md:last:border-r-0">
              <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-ink">
                15 Days
              </span>
              <p className="mt-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Doorstep Exchanges
              </p>
            </div>
            <div className="p-4">
              <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-ink">
                4.9 ★
              </span>
              <p className="mt-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Customer Rating
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE STORY BEHIND FUNKY FOX */}
      <section className="py-16 sm:py-20 lg:py-24 border-b border-[#E8E5DF]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Image with Flagship Studio Tag */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden border border-[#E8E5DF] shadow-md bg-white aspect-[3/4]">
                <img
                  src="/images/standard/model-tall-clean.jpg"
                  alt="Funky Fox Studio Model"
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/category-tshirts.jpg';
                  }}
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full border border-neutral-200 shadow-sm flex items-center gap-1.5 text-[11px] font-bold text-ink">
                  <MapPin size={12} className="text-[#E87535]" />
                  <span>Vijayawada Studio & Fulfilment Hub</span>
                </div>
              </div>
            </div>

            {/* Right Column: Honest Brand Story */}
            <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col items-start lg:pl-6">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E87535]">
                Why We Started
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight leading-[1.08]">
                Born from Frustration with Fast Fashion.
              </h2>

              <div className="mt-6 space-y-4 text-sm sm:text-base text-neutral-600 leading-relaxed">
                <p>
                  Like you, we were exhausted by buying t-shirts that looked decent in the trial room, but became sheer, lost their neckline shape, or shrunk by two sizes after a single gentle wash.
                </p>
                <p>
                  Most fast-fashion brands in India use cheap 140–160 GSM single jersey cotton to maximize margins. At Funky Fox, we flipped the script. We partnered with certified organic spinning mills in India to develop a custom <strong>220 GSM combed interlocking knit</strong>.
                </p>
                <p>
                  The result is clothing with weight, substance, and structure. Pieces that flatter Indian builds, hold their shape in our tropical humidity, and retain their rich colors season after season.
                </p>
              </div>

              {/* Bullet points of assurance */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#E8E5DF]">
                  <CheckCircle2 size={18} className="text-[#E87535] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-ink">Zero Transparent Knits</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Heavyweight density provides opaque, structured drape.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#E8E5DF]">
                  <CheckCircle2 size={18} className="text-[#E87535] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-ink">Anti-Bacon Collar</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">High-recovery spandex ribbing keeps necklines perfectly flat.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 4 CRAFTSMANSHIP STANDARDS */}
      <section id="standards" className="py-16 sm:py-20 lg:py-24 bg-white border-b border-[#E8E5DF]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E87535]">
              Uncompromising Quality
            </span>
            <h2 className="mt-2.5 font-display text-3xl sm:text-4xl font-black text-ink tracking-tight">
              The 4 Funky Fox Standards
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Every single tee, shirt, and layer is designed and manufactured according to these non-negotiable rules.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Standard 1 */}
            <div className="rounded-3xl border border-[#E8E5DF] bg-[#FAF9F6] p-6 flex flex-col justify-between hover:border-ink/30 transition-all hover:-translate-y-1 shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E5DF] flex items-center justify-center text-[#E87535] shadow-2xs">
                  <Layers size={22} />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-ink">
                  220 GSM Heavyweight
                </h3>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Substantial 220 GSM combed organic cotton that feels substantial in the hand and falls naturally without clinging to problem areas.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E5DF] text-[11px] font-bold text-[#E87535]">
                ✓ True Heavyweight Grade
              </div>
            </div>

            {/* Standard 2 */}
            <div className="rounded-3xl border border-[#E8E5DF] bg-[#FAF9F6] p-6 flex flex-col justify-between hover:border-ink/30 transition-all hover:-translate-y-1 shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E5DF] flex items-center justify-center text-[#E87535] shadow-2xs">
                  <RotateCcw size={22} />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-ink">
                  Bio-Silicon Pre-Wash
                </h3>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Every fabric roll undergoes temperature-controlled bio-washing to lock in fibers, eliminate shrinkage, and provide a broken-in handfeel.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E5DF] text-[11px] font-bold text-[#E87535]">
                ✓ Zero Wash Shrinkage
              </div>
            </div>

            {/* Standard 3 */}
            <div className="rounded-3xl border border-[#E8E5DF] bg-[#FAF9F6] p-6 flex flex-col justify-between hover:border-ink/30 transition-all hover:-translate-y-1 shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E5DF] flex items-center justify-center text-[#E87535] shadow-2xs">
                  <Award size={22} />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-ink">
                  1x1 Ribbed Collar
                </h3>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Constructed with reinforced double-needle topstitching and elastane recovery yarn so the collar stays crisp and never ripples.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E5DF] text-[11px] font-bold text-[#E87535]">
                ✓ Stays Snug & Flat
              </div>
            </div>

            {/* Standard 4 */}
            <div className="rounded-3xl border border-[#E8E5DF] bg-[#FAF9F6] p-6 flex flex-col justify-between hover:border-ink/30 transition-all hover:-translate-y-1 shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E5DF] flex items-center justify-center text-[#E87535] shadow-2xs">
                  <Truck size={22} />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-ink">
                  Direct From Our Depot
                </h3>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Shipped straight from our Vijayawada regional distribution depot with 2–4 business days delivery and 15-day risk-free doorstep returns.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E5DF] text-[11px] font-bold text-[#E87535]">
                ✓ Doorstep Exchanges
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FLAGSHIP HUB & TRANSPARENCY SECTION */}
      <section className="py-16 sm:py-20 bg-[#FAF9F6] border-b border-[#E8E5DF]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#E8E5DF] bg-white p-6 sm:p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E87535]">
                  <MapPin size={14} />
                  <span>Flagship Studio & Central Distribution</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-ink">
                  Visit Our Vijayawada Depot
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  All Funky Fox orders are inspected, custom-packed, and dispatched from our primary facility in Vijayawada, Andhra Pradesh.
                </p>

                <div className="bg-[#FAF9F6] rounded-2xl border border-[#E8E5DF] p-4 text-xs space-y-1 font-medium text-neutral-700">
                  <p className="font-bold text-ink text-sm">Funky Fox Menswear Hub</p>
                  <p>Door No. 40-1-58, MG Road, Near Benz Circle</p>
                  <p>Vijayawada, Andhra Pradesh · PIN 520010, India</p>
                  <p className="text-[11px] font-mono text-neutral-500 pt-1">Coordinates: 16.5168591° N, 80.628406° E</p>
                </div>

                <div>
                  <a
                    href="https://maps.google.com/maps?q=16.5168591%2C80.628406&z=17&hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E87535] hover:underline pt-2"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Map Preview Embed */}
              <div className="lg:col-span-5 h-64 rounded-2xl overflow-hidden border border-[#E8E5DF] shadow-xs relative">
                <iframe
                  title="Funky Fox Vijayawada Flagship Location"
                  src="https://maps.google.com/maps?q=16.5168591,80.628406&z=16&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CLOSING CTA */}
      <section className="py-16 sm:py-20 bg-white text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E87535]">
            Experience The Difference
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-black text-ink uppercase tracking-tight">
            Ready to Upgrade Your Everyday?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
            Discover heavyweight cotton essentials designed for lasting drape and everyday comfort. Risk-free 15-day doorstep returns.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/products"
              className="tactile-order-btn text-xs py-3.5 px-9 shadow-md"
            >
              <span>Shop All Everyday Essentials</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. GLOBAL FOOTER (Pushpin Tear Footer) */}
      <Footer />
    </div>
  );
}
