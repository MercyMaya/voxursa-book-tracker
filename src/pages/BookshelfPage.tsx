import { useContext, useEffect, useState } from 'react';
import {
  fetchUserBooks,
  addBook,
  updateUserBook,
  deleteUserBook,
} from '../api';
import type { UserBook } from '../api';
import { AuthContext } from '../contexts/AuthContext';
import EditReviewDialog from '../components/EditReviewDialog';
import RatingStars from '../components/RatingStars';

type Status = UserBook['status'];

export default function BookshelfPage() {
  const { authFetch } = useContext(AuthContext);
  const [books, setBooks] = useState<UserBook[]>([]);
  const [form, setForm] = useState({
    title: '',
    author: '',
    pages: 0,
    status: 'TO_READ' as Status,
  });
  const [editing, setEditing] = useState<UserBook | null>(null);
  const [err, setErr] = useState<string | null>(null);

  /* ── initial & refresh load ───────────────────────────────────── */
  const load = () =>
    fetchUserBooks(authFetch)
      .then(setBooks)
      .catch((e) => setErr(e.message));
        useEffect(() => {
            load();                     // call it, ignore the returned Promise
          }, [authFetch]);

  /* ── CRUD helpers ─────────────────────────────────────────────── */
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await addBook(
      authFetch,
      form.title,
      form.author,
      form.pages,
    );
    /* server sets TO_READ by default; update status if needed */
    if (form.status !== 'TO_READ') {
      await load();
      const added = books.find(
        (b) => b.title === form.title && b.author === form.author,
      );
      if (added) await updateUserBook(authFetch, { id: added.id, status: form.status });
    }
    setForm({ title: '', author: '', pages: 0, status: 'TO_READ' });
    await load();
  }
  const saveReview = async (r: number, txt: string) => {
    if (!editing) return;
    await updateUserBook(authFetch, { id: editing.id, rating: r, review: txt });
    setEditing(null);
    load();
  };
  const changeStatus = (id: number, s: Status) =>
    updateUserBook(authFetch, { id, status: s }).then(load);
  const savePages = (id: number, pages_read: number) =>
    updateUserBook(authFetch, { id, pages_read }).then(load);
  const remove = (id: number) => deleteUserBook(authFetch, id).then(load);

  /* ── UI helpers ───────────────────────────────────────────────── */
  const byStatus = (s: Status) => books.filter((b) => b.status === s);

  return (
    <div className="flex justify-center py-10">
      <div className="w-full max-w-3xl space-y-10 rounded-2xl bg-white p-8 shadow">
        <h1 className="text-center text-2xl font-bold">My Bookshelf</h1>

        {/* Add-book card ------------------------------------------------ */}
        <form onSubmit={handleAdd} className="space-y-4">
          <h2 className="text-lg font-semibold">Add book</h2>
          <div className="grid gap-2 sm:grid-cols-4">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="rounded border p-2 sm:col-span-2"
            />
            <input
              placeholder="Author"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              required
              className="rounded border p-2"
            />
            <input
              type="number"
              placeholder="Pages"
              value={form.pages || ''}
              onChange={(e) =>
                setForm({ ...form, pages: +e.target.value || 0 })
              }
              className="rounded border p-2"
              min={0}
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as Status })
              }
              className="rounded border px-3 py-2"
            >
              <option value="TO_READ">To Read</option>
              <option value="READING">Reading</option>
              <option value="FINISHED">Finished</option>
            </select>
            <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
              Add
            </button>
          </div>
        </form>

        {/* Three-column grid ------------------------------------------ */}
        <div className="grid gap-8 md:grid-cols-3">
          <StatusColumn
            title="To Read"
            books={byStatus('TO_READ')}
            changeStatus={changeStatus}
            remove={remove}
          />

          <StatusColumn
            title="Reading"
            books={byStatus('READING')}
            changeStatus={changeStatus}
            savePages={savePages}
            remove={remove}
          />

          <StatusColumn
            title="Finished"
            books={byStatus('FINISHED')}
            changeStatus={changeStatus}
            remove={remove}
            startReview={(b) => setEditing(b)}
          />
        </div>
      </div>

      {/* Review dialog */}
      {editing && (
        <EditReviewDialog
          book={editing}
          onSave={saveReview}
          onClose={() => setEditing(null)}
        />
      )}

      {err && (
        <p className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded bg-red-100 px-4 py-2 text-red-700 shadow">
          {err}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Column component (reuse)                                          *
 * ------------------------------------------------------------------ */
function StatusColumn({
  title,
  books,
  changeStatus,
  savePages,
  remove,
  startReview,
}: {
  title: string;
  books: UserBook[];
  changeStatus: (id: number, s: Status) => void;
  savePages?: (id: number, pages: number) => void;
  remove: (id: number) => void;
  startReview?: (b: UserBook) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-center text-lg font-semibold">{title}</h3>
      <ul className="space-y-3">
        {books.map((b) => (
          <li key={b.id} className="rounded border p-3 shadow-sm">
            <div className="mb-1 text-sm font-medium">
              {b.title} <span className="text-gray-500">– {b.author}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <select
                value={b.status}
                onChange={(e) =>
                  changeStatus(b.id, e.target.value as Status)
                }
                className="rounded border px-2 py-1"
              >
                <option value="TO_READ">To Read</option>
                <option value="READING">Reading</option>
                <option value="FINISHED">Finished</option>
              </select>

              {b.status === 'READING' && savePages && (
                <ReadingProgress
                  book={b}
                  onSave={(p) => savePages(b.id, p)}
                />
              )}

              {b.status === 'FINISHED' && startReview && (
                <>
                  <RatingStars
                    value={b.rating}
                    onChange={(v) =>
                      startReview({ ...b, rating: v })
                    }
                  />
                  <button
                    onClick={() => startReview(b)}
                    className="underline"
                  >
                    {b.review ? 'Edit review' : 'Add review'}
                  </button>
                </>
              )}

              <button
                onClick={() => remove(b.id)}
                className="ml-auto rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Reading progress mini-form                                        *
 * ------------------------------------------------------------------ */
function ReadingProgress({
  book,
  onSave,
}: {
  book: UserBook;
  onSave: (pages: number) => void;
}) {
  const [pages, setPages] = useState(book.pages_read);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(pages);
      }}
      className="flex items-center gap-1"
    >
      <input
        type="number"
        value={pages}
        onChange={(e) => setPages(+e.target.value)}
        className="w-16 rounded border px-1 py-0.5 text-xs"
        min={0}
        max={book.total_pages || undefined}
      />
      <button className="rounded bg-gray-200 px-2 py-0.5 text-xs hover:bg-gray-300">
        Save
      </button>
    </form>
  );
}
