import { aboutPageContent } from "../../content/about";

const { shoppingConfidence } = aboutPageContent;

/**
 * Small, simple 24×24 line icons — one per point, referenced by key from
 * src/content/about.ts. Rendered in brand orange as a light visual cue.
 */
const icons = {
  // Clothes hanger — browsing the collection
  explore: <path d="M9.5 6.5a2.5 2.5 0 1 1 2.5 2.5V11m0 0-10 7.5h20L12 11z" />,
  // Price tag — visible pricing
  pricing: (
    <>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".75" fill="currentColor" />
    </>
  ),
  // Chat bubble — reaching the team
  help: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />,
};

/**
 * "Shopping With Confidence" section: a short header followed by three
 * concise points. Points sit in a row separated by thin vertical dividers
 * on desktop and stack with horizontal dividers on mobile — no cards.
 */
export default function ShoppingConfidence() {
  return (
    <section
      aria-labelledby="shopping-confidence-heading"
      className="border-t border-ink/10 py-16 sm:py-20 lg:py-24"
    >
      <div className="max-w-2xl">
        <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
          <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
          {shoppingConfidence.eyebrow}
        </p>
        <h2
          id="shopping-confidence-heading"
          className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
        >
          {shoppingConfidence.heading}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-ink/70 sm:text-lg">
          {shoppingConfidence.body}
        </p>
      </div>

      <ul
        role="list"
        className="mt-12 grid divide-y divide-ink/10 sm:mt-14 md:grid-cols-3 md:divide-x md:divide-y-0 lg:mt-16"
      >
        {shoppingConfidence.points.map((point) => (
          <li
            key={point.title}
            className="flex gap-4 py-7 first:pt-0 last:pb-0 md:block md:px-8 md:py-0 md:first:pl-0 md:last:pr-0 lg:px-10"
          >
            <svg
              className="mt-0.5 h-6 w-6 shrink-0 text-brand md:mt-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {icons[point.icon]}
            </svg>
            <div>
              <h3 className="font-display text-lg font-semibold tracking-tight text-ink md:mt-5">
                {point.title}
              </h3>
              <p className="mt-1.5 text-base leading-relaxed text-ink/70 md:mt-2">
                {point.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
