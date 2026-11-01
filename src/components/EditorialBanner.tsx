import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './EditorialBanner.css'

/** The brand edit extends the existing storefront without altering its sections. */
export default function EditorialBanner() {
  return (
    <section
      id="funky-fox-edit"
      className="fox-edit"
      aria-labelledby="fox-edit-heading"
    >
      <div className="fox-edit__layout mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="fox-edit__copy">
          <p className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[.3em] text-soft sm:text-[10.5px]">
            <span aria-hidden="true" className="h-[3px] w-7 rounded-full bg-fox" />
            The Funky Fox Edit
          </p>
          <h2 id="fox-edit-heading" className="fox-edit__headline font-display font-black uppercase text-ink">
            <span>Your style.</span>
            <span>Your <span className="text-fox">rules.</span></span>
          </h2>
          <p className="fox-edit__description text-soft">
            From everyday essentials to statement pieces, find the styles that feel like you.
          </p>
          <Link
            to="/products"
            className="fox-edit__cta group inline-flex h-12 items-center gap-2.5 rounded-full bg-ink pl-6 pr-2 text-[11px] font-bold uppercase tracking-[.18em] text-paper transition-colors hover:bg-fox sm:h-[52px] sm:pl-7"
          >
            Explore the collection
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-ink transition-transform group-hover:translate-x-1 sm:h-9 sm:w-9">
              <ArrowRight size={16} />
            </span>
          </Link>
        </div>
        <div className="fox-edit__photograph">
          <img
            className="fox-edit__image"
            src="/images/editorial-campaign.webp"
            srcSet="/images/editorial-campaign-small.webp 768w, /images/editorial-campaign.webp 1536w"
            sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1279px) 54vw, 650px"
            alt="Male model leaning against a sunlit concrete wall in a charcoal overshirt, ivory T-shirt, relaxed beige trousers and black sneakers."
            width={1536}
            height={1024}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  )
}
