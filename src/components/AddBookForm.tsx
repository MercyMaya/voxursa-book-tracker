import { useState, type FormEvent } from 'react';
import {
  addBook,
  type Status,
  type BookCandidate
} from '../api';

interface Props {
  statusDefault: Status;
  authFetch: Parameters<typeof addBook>[0];
  onAdded: () => void;
  onAutoComplete: (q: string) => Promise<BookCandidate[]>;
}

export default function AddBookForm({
  statusDefault,
  authFetch,
  onAdded,
  onAutoComplete,
}: Props) {
  const [title,  setTitle]  = useState('');
  const [author, setAuthor] = useState('');
  const [pages,  setPages]  = useState(0);
  const [status, setStatus] = useState<Status>(statusDefault);
  const [cover,  setCover]  = useState('');
  const [err,    setErr]    = useState<string | null>(null);
  const [busy,   setBusy]   = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await addBook(authFetch, title, author, pages, cover || null);
      setTitle(''); setAuthor(''); setPages(0); setCover('');
      setStatus(statusDefault);
      onAdded();
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Failed to add book';
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  // quick autofill helper (first result)
  async function tryAutoFill() {
    const list = await onAutoComplete(title);
    if (!list.length) return;
    const b = list[0];
    setTitle(b.title);
    setAuthor(b.author);
    setPages(b.pages ?? 0);
    setCover(b.cover ?? '');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {err && <p className="text-red-600">{err}</p>}

      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={tryAutoFill}
          placeholder="Title"
          className="flex-1 rounded border p-2"
          required
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
          className="flex-1 rounded border p-2"
          required
        />
        <input
          type="number"
          value={pages || ''}
          onChange={(e) => setPages(+e.target.value || 0)}
          placeholder="Pages"
          className="w-24 rounded border p-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          className="rounded border px-2 py-1"
        >
          <option value="TO_READ">Plan to Read</option>
          <option value="READING">Currently Reading</option>
          <option value="FINISHED">Completed</option>
        </select>

        <button
          disabled={busy}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </form>
  );
}
