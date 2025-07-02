// src/components/EditReviewDialog.tsx
import { useState } from 'react';
import type { UserBook } from '../api';
import RatingStars from './RatingStars';

export default function EditReviewDialog({
  book,
  onSave,
  onClose,
}: {
  book: UserBook;
  onSave: (rating: number, review: string) => void;
  onClose: () => void;
}) {
  const [rating, setRating] = useState<number>(book.rating ?? 0);
  const [review, setReview] = useState<string>(book.review ?? '');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md space-y-4 rounded bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold">
          Rate &amp; review “{book.title}”
        </h3>

        <RatingStars value={rating} onChange={setRating} />

        <textarea
          rows={5}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your thoughts…"
          className="w-full resize-none rounded border p-2"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(rating, review)}
            className="rounded bg-blue-600 px-3 py-1 font-semibold text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
