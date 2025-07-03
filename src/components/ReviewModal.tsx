import { useEffect, useState } from 'react';
import RatingStars from './RatingStars';
import type { UserBook } from '../api';

interface Props {
  book: UserBook;
  onSave: (rating: number, review: string) => void;
  onClose: () => void;
}

export default function ReviewModal({ book, onSave, onClose }: Props) {
  const [rating, setRating] = useState(book.rating ?? 0);
  const [review, setReview] = useState(book.review ?? '');

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded bg-white p-6 shadow dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-semibold">
          Review — {book.title}
        </h2>

        <RatingStars value={rating} onChange={setRating} />

        <textarea
          rows={5}
          className="mt-4 w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-900"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded border px-4 py-2 dark:border-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(rating, review);
              onClose();
            }}
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
