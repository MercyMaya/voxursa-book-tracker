import React, { useRef } from 'react';
import { Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { UserBook } from '../api';

/* ------------------------------------------------------------------ *
 *  Props                                                              *
 * ------------------------------------------------------------------ */
interface BookCardProps {
    book: UserBook;
    borderClass?: string;
    /** receive NEW status only; card already knows its id */
    onStatusChange: (newStatus: UserBook['status']) => void;
    onDelete: (id: number) => void;
    onOpenReview: (book: UserBook) => void;
    onProgress?: (pages: number) => void;
  }

/* ------------------------------------------------------------------ *
 *  Component                                                          *
 * ------------------------------------------------------------------ */
const BookCard: React.FC<BookCardProps> = ({
  book,
  borderClass = '',
  onStatusChange,
  onDelete,
  onOpenReview,
  onProgress,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  /* ----- arrow-key grid navigation ------------------------------ */
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const grid = el.parentElement;
    if (!grid) return;

    const cards = Array.from(
      grid.querySelectorAll<HTMLDivElement>('.book-card'),
    );
    const index = cards.indexOf(el);
    if (index === -1) return;

    // columns in current grid row
    const cols = (() => {
      const firstTop = cards[0].offsetTop;
      for (let i = 1; i < cards.length; i++) {
        if (cards[i].offsetTop > firstTop) return i;
      }
      return cards.length;
    })();

    let target: number | null = null;
    switch (e.key) {
      case 'ArrowRight':
        target = index + 1 < cards.length ? index + 1 : null;
        break;
      case 'ArrowLeft':
        target = index - 1 >= 0 ? index - 1 : null;
        break;
      case 'ArrowDown':
        target = index + cols < cards.length ? index + cols : null;
        break;
      case 'ArrowUp':
        target = index - cols >= 0 ? index - cols : null;
        break;
      case 'Enter':
      case ' ':
        if (book.status === 'FINISHED') {
          onOpenReview(book);
          e.preventDefault();
        }
        return;
      default:
        return;
    }

    if (target !== null) {
      e.preventDefault();
      cards[target]?.focus();
    }
  };

  /* ----- handlers ----------------------------------------------- */
  const handleStatus = (e: React.ChangeEvent<HTMLSelectElement>) =>
    onStatusChange(e.target.value as UserBook['status']);

  const handleDelete = () => onDelete(book.id);

  /* ----- render -------------------------------------------------- */
  return (
    <div
      ref={cardRef}
      className={clsx('book-card', borderClass)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${book.title} by ${book.author} – ${book.status}`}
    >
      {/* Cover */}
      {book.cover_url ? (
        <img
          src={book.cover_url}
          alt={`Cover of ${book.title}`}
          className="cover-image"
        />
      ) : (
        <div className="cover-placeholder">No Cover</div>
      )}

      {/* Text */}
      <div className="book-info">
        <span className="book-title" title={book.title}>
          {book.title}
        </span>
        <span className="book-author" title={book.author}>
          {book.author}
        </span>
      </div>

      {/* Actions */}
      <div className="book-actions">
        <select value={book.status} onChange={handleStatus}>
          <option value="TO_READ">Plan to Read</option>
          <option value="READING">Currently Reading</option>
          <option value="FINISHED">Completed</option>
        </select>

        {book.status === 'FINISHED' && (
          <button
            type="button"
            className="review-button"
            onClick={() => onOpenReview(book)}
          >
            Review
          </button>
        )}

        {book.status === 'READING' && onProgress && (
          <button
            type="button"
            className="review-button"
            onClick={() => onProgress((book.pages_read ?? 0) + 1)}
            title="Add one page read"
          >
            +1
          </button>
        )}

        <button
          type="button"
          className="delete-button"
          onClick={handleDelete}
          aria-label="Delete book"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default BookCard;
