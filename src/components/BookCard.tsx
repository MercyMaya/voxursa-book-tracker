import {
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import StarRating from './StarRating';
import {
  type Status,
  type UserBook
} from '../api';

interface Props {
  book: UserBook;
  onStatusChange: (s: Status) => void;
  onDelete: () => void;
  onOpenReview: () => void;
  onProgress: (pages: number) => void;
  borderClass: string;             // Tailwind ring / border colour
}

export default function BookCard({
  book,
  onStatusChange,
  onDelete,
  onOpenReview,
  onProgress,
  borderClass,
}: Props) {
  /* reading-progress form handler */
  function handleProgressSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const field = e.currentTarget.elements.namedItem(
      'pages'
    ) as HTMLInputElement;
    onProgress(+field.value || 0);
  }

  return (
    <article
      className={`flex flex-col gap-2 rounded-lg border bg-white p-3 shadow hover:shadow-md
                  dark:border-slate-700 dark:bg-slate-800 ${borderClass}`}
    >
      {/* cover */}
      {book.cover_url ? (
        <img
          src={book.cover_url}
          alt=""
          className="mx-auto h-40 w-28 rounded object-cover shadow"
          loading="lazy"
        />
      ) : (
        <div className="mx-auto flex h-40 w-28 items-center justify-center rounded bg-slate-200
                        text-xs text-slate-500 dark:bg-slate-700">
          No&nbsp;Cover
        </div>
      )}

      {/* title / author */}
      <div className="min-h-[3rem] text-center">
        <h3 className="font-medium">{book.title}</h3>
        <p className="text-xs text-slate-500">{book.author}</p>
      </div>

      {/* status select */}
      <select
        value={book.status}
        onChange={(e) => onStatusChange(e.target.value as Status)}
        className="mx-auto rounded border px-2 py-1 text-xs
                   dark:border-slate-600 dark:bg-slate-900"
      >
        <option value="TO_READ">Plan to Read</option>
        <option value="READING">Currently Reading</option>
        <option value="FINISHED">Completed</option>
      </select>

      {/* progress */}
      {book.status === 'READING' && (
        <form
          onSubmit={handleProgressSave}
          className="mx-auto flex items-center gap-1 text-xs"
        >
          <input
            name="pages"
            type="number"
            defaultValue={book.pages_read}
            min={0}
            max={book.total_pages ?? undefined}
            className="w-14 rounded border px-1
                       dark:border-slate-600 dark:bg-slate-900"
          />
          &nbsp;/ {book.total_pages ?? '…'}
          <button className="rounded bg-slate-200 px-2 py-0.5 hover:bg-slate-300
                             dark:bg-slate-700 dark:hover:bg-slate-600">
            ✔
          </button>
        </form>
      )}

      {/* rating / review */}
      {book.status === 'FINISHED' && (
        <div className="mx-auto flex flex-col items-center gap-1">
          <StarRating
            value={book.rating ?? 0}
            onChange={() => onOpenReview()}
          />
          <button
            onClick={onOpenReview}
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <PencilSquareIcon className="h-4 w-4" />
            {book.review ? 'Edit Review' : 'Add Review'}
          </button>
        </div>
      )}

      {/* delete */}
      <button
        onClick={onDelete}
        className="ml-auto mt-2 flex items-center gap-1 text-xs text-red-600 hover:underline"
      >
        <TrashIcon className="h-4 w-4" />
        Remove
      </button>
    </article>
  );
}
