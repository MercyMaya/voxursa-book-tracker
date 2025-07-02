import React, { useRef } from 'react';
// You may import icons if using an icon library for the buttons:
import { Trash2 } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  pages?: number;
  cover?: string;
  status: string;
  review?: string;
}

interface BookCardProps {
  book: Book;
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  onOpenReview: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onStatusChange, onDelete, onOpenReview }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation at the card level (arrow keys) and Enter key
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!cardRef.current) return;
    const cardElement = cardRef.current;
    const container = cardElement.parentElement;
    if (!container) return;

    // Collect all card elements in this section
    const cards = Array.from(container.querySelectorAll<HTMLDivElement>('.book-card'));
    const index = cards.indexOf(cardElement);

    let targetIndex: number | null = null;
    const columns = (() => {
      // determine number of columns in the grid by checking when a new row starts
      if (cards.length > 1) {
        const firstTop = cards[0].offsetTop;
        for (let i = 1; i < cards.length; i++) {
          if (cards[i].offsetTop > firstTop) {
            return i; // i is number of columns in the first row
          }
        }
      }
      return cards.length; // if only one row or one card, columns = length
    })();

    switch (e.key) {
      case 'ArrowRight':
        if (index < cards.length - 1) {
          targetIndex = index + 1;
        }
        break;
      case 'ArrowLeft':
        if (index > 0) {
          targetIndex = index - 1;
        }
        break;
      case 'ArrowDown': {
        const downIndex = index + columns;
        if (downIndex < cards.length) {
          targetIndex = downIndex;
        }
        break;
      }
      case 'ArrowUp': {
        const upIndex = index - columns;
        if (upIndex >= 0) {
          targetIndex = upIndex;
        }
        break;
      }
      case 'Enter':
      case ' ':  // Space bar
        if (book.status === 'Completed') {
          // Open review modal for completed book
          onOpenReview(book);
          e.preventDefault();
        } else {
          // If not completed, do nothing special on Enter (could potentially open details in future)
        }
        return;
      default:
        return;
    }

    if (targetIndex !== null) {
      e.preventDefault();  // prevent page scroll on arrow keys
      const targetCard = cards[targetIndex];
      targetCard?.focus();
    }
  };

  // Callback when user selects a new status from dropdown
  const handleStatusSelect: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    onStatusChange(book.id, e.target.value);
  };

  // Callback for delete button
  const handleDeleteClick = () => {
    onDelete(book.id);
  };

  return (
    <div 
      className={`book-card ${book.status.replace(' ', '-').toLowerCase()}-card`} 
      ref={cardRef} 
      tabIndex={0} 
      onKeyDown={handleKeyDown}
      aria-label={`${book.title} by ${book.author} - ${book.status}`}  // Accessible label for the card
    >
      {/* Book Cover */}
      {book.cover ? (
        <img src={book.cover} alt={`Cover of ${book.title}`} className="cover-image" />
      ) : (
        <div className="cover-placeholder">No Cover</div>
      )}

      {/* Book Title & Author */}
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.author}</div>
      </div>

      {/* Actions: Status dropdown & any relevant buttons */}
      <div className="book-actions">
        {/* Status Selector */}
        <select 
          value={book.status} 
          onChange={handleStatusSelect} 
          aria-label="Change status"
        >
          <option>Plan to Read</option>
          <option>Currently Reading</option>
          <option>Completed</option>
        </select>

        {/* Review button (only for completed books) */}
        {book.status === 'Completed' && (
          <button 
            type="button" 
            className="review-button" 
            onClick={() => onOpenReview(book)} 
            aria-label="Add or view review"
          >
            Review
          </button>
        )}

        {/* Delete button */}
        <button 
          type="button" 
          className="delete-button" 
          onClick={handleDeleteClick} 
          aria-label="Delete book"
        >
          {/* Trash icon using FontAwesome (if available) */}
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default BookCard;
