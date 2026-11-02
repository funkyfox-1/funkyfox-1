import AboutIntro from "../components/about/AboutIntro";
import WhatWeSell from "../components/about/WhatWeSell";
import QualityValue from "../components/about/QualityValue";
import FindUs from "../components/about/FindUs";
import ShoppingConfidence from "../components/about/ShoppingConfidence";
import Founder from "../components/about/Founder";

/**
 * Funky Fox — About Us page.
 *
 * Standalone, reusable page component (no navbar/footer — those are
 * provided by the existing website). Sections are stacked inside a
 * single centered container and will be added one at a time below
 * the introduction.
 */
export default function AboutUs() {
  return (
    <main className="min-h-screen bg-cream font-sans text-ink antialiased">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12">
        <Founder />
        <AboutIntro />
        <WhatWeSell />
        <QualityValue />
        <FindUs />
        <ShoppingConfidence />
        {/* Future About Us sections go here, one at a time. */}
      </div>
    </main>
  );
}
