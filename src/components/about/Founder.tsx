import { aboutPageContent } from "../../content/about";

export interface FounderProps {
  eyebrow?: string;
  name?: string;
  role?: string;
  introduction?: readonly string[];
  portrait?: {
    src: string;
    alt: string;
  };
}

/**
 * Editorial Founder section.
 *
 * Sits directly on the warm-white page background without any card, border box,
 * or highlighted container. Uses a slightly asymmetrical 12-column composition
 * pairing a large replaceable portrait with confident typography and a short
 * personal note underneath.
 */
export default function Founder({
  eyebrow = aboutPageContent.founder.eyebrow,
  name = aboutPageContent.founder.name,
  role = aboutPageContent.founder.role,
  introduction = aboutPageContent.founder.introduction,
  portrait = aboutPageContent.founder.portrait,
}: FounderProps) {
  return (
    <section
      aria-labelledby="founder-heading"
      className="animate-gentle-fade border-b border-ink/10 py-16 sm:py-20 lg:py-24"
    >
      <div className="grid items-start gap-10 sm:gap-12 lg:grid-cols-12 lg:gap-12">
        {/* Large replaceable portrait sitting directly on the page background */}
        <div className="lg:col-span-5">
          <img
            src={portrait.src}
            alt={portrait.alt}
            className="aspect-[4/5] w-full rounded-2xl object-cover"
          />
        </div>

        {/* Asymmetrical editorial text column beside the photograph */}
        <div className="lg:col-span-6 lg:col-start-7 lg:pt-6">
          <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
            <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
            {eyebrow}
          </p>

          <h2
            id="founder-heading"
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
          >
            {name}
          </h2>

          <p className="mt-2 text-sm font-medium tracking-wide text-ink/60 sm:text-base">
            {role}
          </p>

          {/* Small tasteful orange accent separating the title lockup from the note */}
          <div
            className="mt-7 h-0.5 w-10 rounded-full bg-brand"
            aria-hidden="true"
          />

          <div className="mt-7 max-w-xl space-y-4 text-base leading-relaxed text-ink/75 sm:text-lg">
            {introduction.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
