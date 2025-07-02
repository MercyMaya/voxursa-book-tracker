import { Trash2 } from 'lucide-react';
import type { UserBook } from '../api';
import RatingStars from './RatingStars';
import clsx from 'clsx';

export default function BookCard({
  book,
  onRemove,
  onStatus,
  onProgress,
  onReview,
}: {
  book: UserBook;
  onRemove: () => void;
  onStatus: (s: UserBook['status']) => void;
  onProgress?: (pages: number) => void;
  onReview?: () => void;
}) {
  return (
    <article
      className={clsx(
        'relative flex gap-4 rounded-xl border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800',
      )}
    >
      {book.cover_url ? (
        <img
          src={book.cover_url}
          alt=""
          className="h-24 w-16 shrink-0 rounded object-cover shadow"
        />
      ) : (
        <div className="h-24 w-16 shrink-0 rounded bg-slate-200 dark:bg-slate-700" />
      )}

      <div className="flex-1">
        <h3 className="font-semibold leading-tight">{book.title}</h3>
        <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">
          {book.author}
        </p>

        {/* status / rating / progress */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select
            value={book.status}
            onChange={(e) => onStatus(e.target.value as any)}
            className="rounded border px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="TO_READ">To read</option>
            <option value="READING">Reading</option>
            <option value="FINISHED">Finished</option>
          </select>

          {book.status === 'READING' && onProgress && (
            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                onProgress(
                  Number(
                    (ev.currentTarget.elements.namedItem(
                      'pg',
                    ) as HTMLInputElement).value,
                  ),
                );
              }}
              className="flex items-center gap-1"
            >
              <input
                name="pg"
                type="number"
                defaultValue={book.pages_read}
                className="w-16 rounded border px-1 py-0.5 text-xs dark:border-slate-600 dark:bg-slate-800"
              />
              <button className="rounded bg-slate-100 px-2 py-0.5 text-xs hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600">
                Save
              </button>
            </form>
          )}

          {book.status === 'FINISHED' && onReview && (
            <>
              <RatingStars value={book.rating} onChange={() => {}} />
              <button
                onClick={onReview}
                className="underline decoration-dashed hover:no-underline"
              >
                {book.review ? 'Edit' : 'Add'} review
              </button>
            </>
          )}
        </div>
      </div>

      <button
        onClick={onRemove}
        className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-700"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </article>
  );
}
