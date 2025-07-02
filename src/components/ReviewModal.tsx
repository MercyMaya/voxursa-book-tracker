import React, { useEffect, useRef, useState } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  // ...other fields
  review?: string;
}

interface ReviewModalProps {
  book: Book;
  onClose: () => void;
  onSave: (bookId: string, reviewText: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ book, onClose, onSave }) => {
  const [reviewText, setReviewText] = useState<string>(book.review || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Trap focus within modal: focus the textarea on open
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Handle pressing Escape key to close modal
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSave = () => {
    onSave(book.id, reviewText.trim());
    onClose();
  };

  return (
    <div className="modal-backdrop" onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="review-title">
        <h3 id="review-title">Review: {book.title}</h3>
        <p><em>{book.author}</em></p>
        <textarea 
          ref={textareaRef}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={6}
          placeholder="Write your thoughts about the book..."
        />
        <div className="modal-buttons">
          <button onClick={onClose} className="cancel-button">Cancel</button>
          <button onClick={handleSave} className="save-button">Save Review</button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
