import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import RatingStars from './RatingStars';
import type { UserBook, Status } from '../api';

interface BookCardProps {
  book: UserBook;
  borderClass: string;
  onStatusChange: (s: Status) => void;
  onProgress: (pages: number) => void;
  onOpenReview: () => void;
  onDelete: () => void;
}

export default function BookCard({
  book,
  borderClass,
  onStatusChange,
  onProgress,
  onOpenReview,
  onDelete,
}: BookCardProps) {
  const [pages, setPages] = useState(book.pages_read);

  return (
    <div
      className={`flex flex-col space-y-3 rounded-lg bg-white p-4 shadow dark:bg-slate-800 ${borderClass}`}
    >
      {book.cover_url ? (
        <img
          src={book.cover_url}
          alt=""
          className="mb-2 h-48 w-full rounded object-cover"
          loading="lazy"
        />
      ) : (
        <div className="mb-2 h-48 w-full rounded bg-slate-200 dark:bg-slate-700" />
      )}

      <h3 className="font-semibold">{book.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{book.author}</p>

      <select
        value={book.status}
        onChange={(e) => onStatusChange(e.target.value as Status)}
        className="rounded border px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900"
      >
        <option value="TO_READ">Plan to Read</option>
        <option value="READING">Currently Reading</option>
        <option value="FINISHED">Completed</option>
      </select>

      {book.status === 'READING' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onProgress(pages);
          }}
          className="flex items-center gap-2 text-sm"
        >
          <input
            type="number"
            min={0}
            max={book.total_pages ?? undefined}
            value={pages}
            onChange={(e) => setPages(+e.target.value)}
            className="w-16 rounded border p-1 dark:border-slate-600 dark:bg-slate-900"
          />
          <button className="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
            Save
          </button>
        </form>
      )}

      {book.status === 'FINISHED' && (
        <div className="flex items-center justify-between">
          <RatingStars value={book.rating ?? 0} disabled />
          <button
            onClick={onOpenReview}
            className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
          >
            {book.review ? 'Edit Review' : 'Review'}
          </button>
        </div>
      )}

      <button
        onClick={onDelete}
        className="self-end rounded bg-red-100 p-2 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300"
        aria-label="Delete book"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
