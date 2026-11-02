import * as React from 'react';
import AboutIntro from './about/AboutIntro';
import WhatWeSell from './about/WhatWeSell';
import QualityValue from './about/QualityValue';
import FindUs from './about/FindUs';
import ShoppingConfidence from './about/ShoppingConfidence';
import Founder from './about/Founder';
import Footer from './Footer';

/**
 * Funky Fox — About Us page.
 *
 * Standalone, reusable page component integrated with the existing website's footer.
 * Sections: Founder, AboutIntro, WhatWeSell, QualityValue, FindUs, ShoppingConfidence.
 */
export default function AboutPage() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-cream font-sans text-ink antialiased flex flex-col justify-between selection:bg-brand selection:text-white">
      <main className="w-full flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12 pt-20 sm:pt-24 lg:pt-28 pb-12">
          <Founder />
          <AboutIntro />
          <WhatWeSell />
          <QualityValue />
          <FindUs />
          <ShoppingConfidence />
        </div>
      </main>
      <Footer />
    </div>
  );
}
