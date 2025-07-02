import { useState, useEffect } from 'react';
import { searchGoogleBooks } from '../api';
import type { BookCandidate } from '../api';

export default function BookAutoComplete({
  onSelect,
}: {
  onSelect: (b: BookCandidate) => void;
}) {
  const [q, setQ] = useState('');
  const [list, setList] = useState<BookCandidate[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      searchGoogleBooks(q).then(setList);
    }, 300);                 // debounce
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setShow(true);
        }}
        placeholder="Search Google Books…"
        className="w-full rounded border p-2"
      />
      {show && list.length > 0 && (
        <ul className="absolute z-10 max-h-60 w-full overflow-auto rounded border bg-white shadow">
          {list.map((b, i) => (
            <li
              key={i}
              onClick={() => {
                onSelect(b);
                setQ('');
                setShow(false);
              }}
              className="flex cursor-pointer items-center gap-2 px-2 py-1 hover:bg-gray-100"
            >
              {b.cover && (
                <img src={b.cover} alt="" className="h-10 w-7 object-cover" />
              )}
              <span>
                {b.title} – <em>{b.author}</em>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
