import * as React from 'react';
import {
  Star,
  Sparkles,
  CheckCircle2,
  Camera,
  Shirt,
  ArrowRight,
  Award
} from 'lucide-react';
import { Order, addDemoReview, getDemoReviews, getDemoUser, updateDemoProfile } from '../../data/accountMockData';
import { showToast } from '../../utils/toast';

interface DeliveredOrderReviewCardProps {
  order: Order;
  onReviewSubmitted?: () => void;
}

export default function DeliveredOrderReviewCard({ order, onReviewSubmitted }: DeliveredOrderReviewCardProps) {
  const primaryItem = order.items[0];
  const [rating, setRating] = React.useState<number>(5);
  const [hoverRating, setHoverRating] = React.useState<number>(0);
  const [selectedFitTag, setSelectedFitTag] = React.useState<string>('True to Size');
  const [reviewComment, setReviewComment] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Check if this item is already reviewed
  React.useEffect(() => {
    if (!primaryItem) return;
    const existing = getDemoReviews();
    const found = existing.some((r) => r.productId === primaryItem.id);
    if (found) {
      setIsSubmitted(true);
    }
  }, [primaryItem]);

  if (order.status !== 'delivered' || !primaryItem) {
    return null;
  }

  const fitTags = [
    'True to Size',
    'Runs Slightly Large',
    'Runs Slightly Small',
    'Ultra-Breathable',
    'Heavyweight Fabric',
    'Flattering Everyday Drape'
  ];

  const ratingLabels: Record<number, string> = {
    1: 'Needs Improvement',
    2: 'Fair Quality',
    3: 'Met Expectations',
    4: 'Great Fit & Feel',
    5: 'Absolute Perfection!'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      showToast('Please select a star rating first', { type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      // 1. Add review
      const mappedFit: 'true_to_size' | 'runs_small' | 'runs_large' =
        selectedFitTag.includes('Large') ? 'runs_large' :
        selectedFitTag.includes('Small') ? 'runs_small' : 'true_to_size';

      addDemoReview({
        productId: primaryItem.id,
        productName: primaryItem.name,
        productImage: primaryItem.image,
        rating,
        title: `${ratingLabels[rating] || 'Satisfied'} · ${selectedFitTag}`,
        comment: reviewComment.trim() || `The ${primaryItem.name} delivered exceptional handfeel and cut. Fits ${selectedFitTag.toLowerCase()}.`,
        fitFeedback: mappedFit
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Review submitted! Thank you for your feedback.', { type: 'success' });
      if (onReviewSubmitted) onReviewSubmitted();
    }, 700);
  };

  if (isSubmitted) {
    return (
      <div className="rounded-2xl sm:rounded-3xl border border-[#D9D3C5] bg-gradient-to-br from-white to-[#FAF8F2] p-6 sm:p-8 shadow-[0_8px_24px_-10px_rgba(28,29,26,0.06)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Verified Review Published
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E87535]/10 text-[#E87535]">
                  <Award size={12} /> +50 pts
                </span>
              </div>
              <h3 className="font-sans text-base sm:text-lg font-black text-[#1c1d1a] tracking-tight mt-0.5">
                Thank you for rating your {primaryItem.name}!
              </h3>
              <p className="text-xs text-[#666259] mt-0.5">
                Your styling feedback helps fellow shoppers choose the right cut and size.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[#F59E0B]">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={16} className="fill-[#F59E0B]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeRating = hoverRating || rating;

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-[#E2DBD0] bg-gradient-to-br from-white via-[#FCFAF5] to-[#FAF6ED] p-6 sm:p-8 shadow-[0_10px_32px_-12px_rgba(28,29,26,0.08)] relative overflow-hidden">
      {/* Decorative Brand Accent Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E87535]/10 border border-[#E87535]/20 text-[#E87535] text-[11px] font-bold uppercase tracking-widest">
          <Sparkles size={13} />
          <span>Verified Delivery Review</span>
        </div>
        <span className="text-xs font-semibold text-[#78756e]">
          Order #{order.orderNumber}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Garment Snapshot */}
        <div className="lg:col-span-4 flex items-center lg:flex-col lg:items-start gap-4 p-4 rounded-2xl bg-white border border-[#EAE4D8] shadow-2xs">
          <img
            src={primaryItem.image}
            alt={primaryItem.name}
            className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl object-cover bg-[#FAF8F2] shrink-0 border border-[#EAE4D8]"
            onError={(e) => {
              e.currentTarget.src = '/images/product-tshirt.webp';
            }}
          />
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#78756e] block">
              Delivered Piece
            </span>
            <h4 className="font-sans text-sm sm:text-[15px] font-bold text-[#1c1d1a] truncate mt-0.5">
              {primaryItem.name}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-[#666259]">
              <span className="font-semibold">Size: {primaryItem.size}</span>
              <span>·</span>
              <span>{primaryItem.color}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Review Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-5">
          {/* Headline */}
          <div>
            <h3 className="font-sans text-lg sm:text-xl font-black text-[#1c1d1a] tracking-tight">
              How did your fit turn out?
            </h3>
            <p className="text-xs text-[#666259] mt-1 leading-relaxed">
              Rate your piece to help fellow customers dial in their sizing.
            </p>
          </div>

          {/* Interactive Star Rating */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-1.5" role="group" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = star <= activeRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 sm:p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-transform hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87535] touch-manipulation"
                    aria-label={`Rate ${star} of 5 stars`}
                  >
                    <Star
                      size={26}
                      strokeWidth={1.5}
                      className={`transition-colors ${
                        isLit
                          ? 'fill-[#F59E0B] text-[#F59E0B] drop-shadow-xs'
                          : 'text-[#D1CBBF] hover:text-[#B8B2A6]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-[#1c1d1a]">
              {ratingLabels[activeRating] || 'Select rating'}
            </span>
          </div>

          {/* Fit Impression Pills */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78756e] mb-2">
              Fit & Cut Impression
            </label>
            <div className="flex flex-wrap gap-2">
              {fitTags.map((tag) => {
                const isSelected = selectedFitTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedFitTag(tag)}
                    className={`px-3 py-2 min-h-[38px] inline-flex items-center rounded-xl text-xs font-semibold transition-all touch-manipulation ${
                      isSelected
                        ? 'bg-[#1c1d1a] text-white shadow-xs'
                        : 'bg-white hover:bg-[#F3EFE6] text-[#403e39] border border-[#DDD6C8]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Comment Textarea */}
          <div>
            <label htmlFor="review-comment" className="block text-[11px] font-bold uppercase tracking-wider text-[#78756e] mb-1.5">
              Fit Notes & Feedback (Optional)
            </label>
            <textarea
              id="review-comment"
              rows={2}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="How does the fabric drape? How was the collar, chest, or sleeve length?..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D3C5] bg-white text-xs sm:text-sm text-[#1c1d1a] placeholder:text-[#99958C] focus:outline-none focus:border-[#E87535] focus:ring-2 focus:ring-[#E87535]/15 transition-all resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#78756e] flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              Verified Funky Fox Buyer
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c1d1a] hover:bg-[#2b2c27] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Publishing...' : 'Submit Review (+50 Pts)'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
