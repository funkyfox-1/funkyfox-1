import { aboutPageContent } from "../../content/about";

const { qualityValue } = aboutPageContent;

/**
 * "Quality You Can Feel" section: short text paired with one fabric-detail
 * image. Text sits on the left (mirroring the section above) for rhythm.
 */
export default function QualityValue() {
  return (
    <section
      aria-labelledby="quality-value-heading"
      className="border-t border-ink/10 py-16 sm:py-20 lg:py-24"
    >
      <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="order-2 lg:order-1 lg:col-span-6">
          <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
            <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
            {qualityValue.eyebrow}
          </p>
          <h2
            id="quality-value-heading"
            className="mt-4 max-w-lg font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
          >
            {qualityValue.heading}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/70 sm:text-lg">
            {qualityValue.body}
          </p>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-5 lg:col-start-8">
          <div className="overflow-hidden rounded-2xl">
            <img
              src={qualityValue.image.src}
              alt={qualityValue.image.alt}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-[1.03] sm:aspect-[16/10] lg:aspect-[4/5]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
