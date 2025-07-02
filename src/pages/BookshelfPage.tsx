import { useContext, useEffect, useState } from 'react';
import {
  fetchUserBooks,
  addBook,
  updateUserBook,
  deleteUserBook,
  UserBook,
} from '../api';
import { AuthContext } from '../contexts/AuthContext';

export default function BookshelfPage() {
  const { authFetch } = useContext(AuthContext);
  const [books, setBooks] = useState<UserBook[]>([]);
  const [form, setForm] = useState({ title: '', author: '', pages: 0 });
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setBooks(await fetchUserBooks(authFetch));
    } catch (e: any) {
      setErr(e.message);
    }
  }
  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await addBook(authFetch, form.title, form.author, form.pages);
    setForm({ title: '', author: '', pages: 0 });
    load();
  }

  function renderSection(label: string, status: UserBook['status']) {
    const list = books.filter((b) => b.status === status);
    return (
      <div>
        <h2 className="mb-2 text-lg font-bold">{label}</h2>
        {list.length === 0 && <p className="mb-4 text-sm text-gray-500">None</p>}
        <ul className="space-y-3">
          {list.map((b) => (
            <li key={b.id} className="rounded border p-3">
              <div className="flex items-center justify-between">
                <span>
                  <strong>{b.title}</strong> – {b.author}
                </span>
                <small className="text-xs text-gray-500">{b.status}</small>
              </div>
              {b.status === 'READING' && (
                <ProgressInput book={b} onSave={updateAndReload} />
              )}
              <button
                className="mt-2 rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
                onClick={() => deleteAndReload(b.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  async function updateAndReload(payload: Partial<UserBook> & { id: number }) {
    await updateUserBook(authFetch, payload);
    load();
  }
  async function deleteAndReload(id: number) {
    await deleteUserBook(authFetch, id);
    load();
  }

  if (err) return <p className="m-8 text-red-700">Error: {err}</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      {/* Quick-add form */}
      <form onSubmit={handleAdd} className="space-y-2 rounded border p-4">
        <h2 className="font-bold">Add book</h2>
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded border p-2"
          required
        />
        <input
          type="text"
          placeholder="Author"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          className="w-full rounded border p-2"
          required
        />
        <input
          type="number"
          placeholder="Pages (optional)"
          value={form.pages || ''}
          onChange={(e) => setForm({ ...form, pages: +e.target.value })}
          className="w-full rounded border p-2"
          min={0}
        />
        <button className="rounded bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700">
          Add
        </button>
      </form>

      {/* Sections */}
      {renderSection('To Read', 'TO_READ')}
      {renderSection('Currently Reading', 'READING')}
      {renderSection('Finished', 'FINISHED')}
    </div>
  );
}

/* Component for progress entry */
function ProgressInput({
  book,
  onSave,
}: {
  book: UserBook;
  onSave: (p: Partial<UserBook> & { id: number }) => void;
}) {
  const [pages, setPages] = useState(book.pages_read);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ id: book.id, pages_read: pages });
      }}
      className="mt-2 flex items-center space-x-2 text-sm"
    >
      <input
        type="number"
        value={pages}
        onChange={(e) => setPages(+e.target.value)}
        className="w-20 rounded border p-1"
        min={0}
        max={book.total_pages || undefined}
      />
      <button className="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300">
        Save
      </button>
    </form>
  );
}
