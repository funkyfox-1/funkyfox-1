import { aboutPageContent } from "../../content/about";

const { findUs } = aboutPageContent;
const { lat, lng } = findUs.location;

// Key-free Google Maps embed + direct link to the exact coordinates.
const embedSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
const mapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

/**
 * "Find Us" section: concise text with an interactive Google Map.
 */
export default function FindUs() {
  return (
    <section
      aria-labelledby="find-us-heading"
      className="border-t border-ink/10 py-16 sm:py-20 lg:py-24"
    >
      <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
            <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
            {findUs.eyebrow}
          </p>
          <h2
            id="find-us-heading"
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
          >
            {findUs.heading}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink/70 sm:text-lg">
            {findUs.body}
          </p>

          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            {findUs.linkLabel}
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>

        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl bg-ink/5">
            <iframe
              title="Funky Fox location on Google Maps"
              src={embedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="block aspect-[4/3] w-full border-0 lg:aspect-[16/11]"
            />
          </div>
          <p className="mt-3 text-xs text-ink/50">
            Map not loading?{" "}
            <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-deep underline-offset-2 hover:underline">
              View the location on Google Maps
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
