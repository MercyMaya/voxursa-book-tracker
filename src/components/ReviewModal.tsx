import { useEffect, useRef, useState } from 'react';
import type { UserBook } from '../api';

interface Props {
  book: UserBook;
  onClose: () => void;
  onSave: (rating: number, review: string) => void;
}

export default function ReviewModal({ book, onClose, onSave }: Props) {
  const [text, setText] = useState(book.review ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => textareaRef.current?.focus(), []);

  function handleSave() {
    onSave(5, text);           // rating hard-coded 5★ for now
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded bg-white p-6 shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-semibold">
          Review&nbsp;– {book.title}
        </h3>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full rounded border p-2"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-blue-600 px-4 py-1 font-semibold text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}