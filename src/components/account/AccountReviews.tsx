import * as React from 'react';
import { Star, Plus, CheckCircle2, MessageSquare, ChevronDown } from 'lucide-react';
import { getDemoReviews, addDemoReview, ProductReview } from '../../data/accountMockData';
import { products } from '../../data/products';
import './AccountStyles.css';

export default function AccountReviews() {
  const [reviews, setReviews] = React.useState<ProductReview[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [productId, setProductId] = React.useState(products[0]?.id || '');
  const [rating, setRating] = React.useState(5);
  const [title, setTitle] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [fitFeedback, setFitFeedback] = React.useState<'true_to_size' | 'runs_small' | 'runs_large'>('true_to_size');
  const [successMsg, setSuccessMsg] = React.useState('');

  React.useEffect(() => {
    setReviews(getDemoReviews());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === productId) || products[0];
    const newRev = addDemoReview({
      productId: prod.id,
      productName: prod.name,
      productImage: prod.image,
      rating,
      title,
      comment,
      fitFeedback
    });

    setReviews([newRev, ...reviews]);
    setIsModalOpen(false);
    setTitle('');
    setComment('');
    setSuccessMsg('Thank you! Your verified customer review has been added in demo mode.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0ECE1] pb-5">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-ink">
            My Reviews ({reviews.length})
          </h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Share feedback on fabric weight, fit, and collar durability to help fellow community members.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 py-2 px-4 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <Plus size={14} /> Write a Review
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="rounded-xl border border-[#E8E5DF] bg-white p-5 hover:border-neutral-400 transition-all shadow-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F0ECE1] pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={rev.productImage}
                  alt={rev.productName}
                  className="w-12 h-14 object-cover rounded-md border border-[#E8E5DF] bg-[#FAF9F6]"
                  onError={(e) => {
                    e.currentTarget.src = '/images/product-tshirt.webp';
                  }}
                />
                <div>
                  <h3 className="text-sm font-bold text-ink">{rev.productName}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={star <= rev.rating ? 'fill-[#E87535] text-[#E87535]' : 'text-neutral-300'}
                      />
                    ))}
                    <span className="text-[11px] font-semibold text-neutral-500 ml-1">
                      {rev.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 inline-block">
                  Verified Purchase
                </span>
                <p className="text-[10px] text-neutral-400 mt-1">{rev.date}</p>
              </div>
            </div>

            <div className="mt-3">
              <h4 className="text-xs font-bold text-ink">{rev.title}</h4>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{rev.comment}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Fit Feedback:
                </span>
                <span className="text-[10px] font-semibold text-neutral-700 bg-[#FAF9F6] border border-[#E8E5DF] px-2 py-0.5 rounded-md">
                  {rev.fitFeedback === 'true_to_size'
                    ? 'True to Size'
                    : rev.fitFeedback === 'runs_small'
                    ? 'Runs Small (Size Up)'
                    : 'Runs Large (Relaxed)'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8E5DF] max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-display text-lg font-black uppercase text-ink mb-1">
              Write Product Review
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Help other shoppers choose the right cut and fabric weight.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Product
                </label>
                <div className="relative w-full">
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full appearance-none -webkit-appearance-none px-3.5 pr-10 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-neutral-300 bg-white hover:bg-[#FAF9F6] focus:border-[#E87535] focus:ring-2 focus:ring-[#E87535]/15 focus:outline-none transition-colors cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 text-neutral-300 hover:text-[#E87535]"
                    >
                      <Star
                        size={22}
                        className={s <= rating ? 'fill-[#E87535] text-[#E87535]' : 'text-neutral-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Perfect heavyweight cotton feel"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:border-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Detailed Comments
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={3}
                  placeholder="Share details on wash durability, collar rigidity, and torso drape..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:border-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Fit Perception
                </label>
                <div className="relative w-full">
                  <select
                    value={fitFeedback}
                    onChange={(e) => setFitFeedback(e.target.value as any)}
                    className="w-full appearance-none -webkit-appearance-none px-3.5 pr-10 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-neutral-300 bg-white hover:bg-[#FAF9F6] focus:border-[#E87535] focus:ring-2 focus:ring-[#E87535]/15 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="true_to_size">True to Size (Recommended)</option>
                    <option value="runs_small">Runs Slightly Small</option>
                    <option value="runs_large">Runs Slightly Large</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-full border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

