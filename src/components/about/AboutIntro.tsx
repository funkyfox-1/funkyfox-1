import { aboutPageContent } from "../../content/about";

/**
 * Foundation of the About Us page: simple heading + short introduction.
 * Additional sections are added below this one, one at a time.
 */
export default function AboutIntro() {
  return (
    <section
      aria-labelledby="about-funky-fox-heading"
      className="pb-16 pt-16 sm:pb-20 sm:pt-24 lg:pt-28"
    >
      {/* Small brand accent */}
      <div className="h-1 w-14 rounded-full bg-brand" aria-hidden="true" />

      <h1
        id="about-funky-fox-heading"
        className="mt-6 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl"
      >
        {aboutPageContent.heading}
      </h1>

      <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-ink/70 sm:text-lg">
        {aboutPageContent.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
