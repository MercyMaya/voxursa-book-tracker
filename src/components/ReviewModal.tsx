import { useEffect, useState } from 'react';
import StarRating from './StarRating';
import { type UserBook } from '../api';

interface Props {
  book: UserBook;
  onSave: (id: number, upd: { rating: number; review: string }) => void;
  onClose: () => void;
}

export default function ReviewModal({ book, onSave, onClose }: Props) {
  const [rating, setRating] = useState<number>(book.rating ?? 0);
  const [review, setReview] = useState<string>(book.review ?? '');

  /* close on Esc */
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', h);
    return () => removeEventListener('keydown', h);
  }, [onClose]);

  function handleSave() {
    onSave(book.id, { rating, review });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-semibold">
          Review: {book.title}
        </h3>

        <StarRating value={rating} onChange={setRating} />

        <textarea
          className="textarea textarea-bordered mt-4 w-full"
          rows={4}
          placeholder="Your thoughts…"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
