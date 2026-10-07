import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { api } from '../services/api.js';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  revieweeId: string;
  revieweeName: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  revieweeId,
  revieweeName,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide feedback comments for the review.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.reviews.submit({
        projectId,
        revieweeId,
        rating,
        comment: comment.trim(),
      });
      onReviewSubmitted?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative inline-block w-full max-w-md p-6 sm:p-8 my-8 text-left bg-white rounded-2xl shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Leave a Rating & Review</h3>
              <p className="text-xs text-slate-500 mt-0.5">For {revieweeName}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Star selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Overall Rating:</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-300 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          filled ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-2 text-sm font-bold text-slate-800 font-mono tabular-nums">
                  {rating}.0 / 5.0
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Feedback & Experience:
              </label>
              <textarea
                rows={4}
                placeholder="Share feedback on communication, deliverable quality, technical expertise, and timeliness..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Posting Review...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
