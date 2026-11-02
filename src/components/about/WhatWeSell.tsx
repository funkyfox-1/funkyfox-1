import { aboutPageContent } from "../../content/about";

const { whatWeSell } = aboutPageContent;

/**
 * "What We Sell" section: a simple editorial layout pairing one large
 * clothing image (with a smaller overlapping image for composition)
 * with a short text block. Copy lives in src/content/about.ts.
 */
export default function WhatWeSell() {
  return (
    <section
      aria-labelledby="what-we-sell-heading"
      className="border-t border-ink/10 py-16 sm:py-20 lg:py-24"
    >
      <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Image composition */}
        <div className="relative sm:pb-12 lg:col-span-7 lg:pb-14">
          <img
            src={whatWeSell.images.main.src}
            alt={whatWeSell.images.main.alt}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-2xl object-cover sm:aspect-[16/10] lg:aspect-[4/3]"
          />
          {/* Smaller image overlapping the corner on larger screens */}
          <div className="mt-4 flex justify-end sm:absolute sm:bottom-0 sm:right-0 sm:mt-0 sm:w-44 lg:w-56">
            <img
              src={whatWeSell.images.secondary.src}
              alt={whatWeSell.images.secondary.alt}
              loading="lazy"
              className="aspect-[3/4] w-36 rounded-xl border-[6px] border-cream object-cover shadow-lg shadow-ink/10 sm:w-full"
            />
          </div>
        </div>

        {/* Text block */}
        <div className="lg:col-span-5">
          <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
            <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
            {whatWeSell.eyebrow}
          </p>

          <h2
            id="what-we-sell-heading"
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
          >
            {whatWeSell.heading}
          </h2>

          <p className="mt-5 text-base leading-relaxed text-ink/80 sm:text-lg">
            {whatWeSell.lead}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink/60 sm:text-base">
            {whatWeSell.body}
          </p>
        </div>
      </div>
    </section>
  );
}
