/* ------------------------------------------------------------------ *
 *  BookshelfPage                                                     *
 * ------------------------------------------------------------------ */
import { useContext, useEffect, useState } from 'react';
import {
  fetchUserBooks,
  updateUserBook,
  deleteUserBook,
  addBook,
  type UserBook,
  type BookCandidate,
  type Status,
} from '../api';
import { AuthContext } from '../contexts/AuthContext';
import BookAutoComplete from '../components/BookAutoComplete';
import BookCard from '../components/BookCard';
import ReviewModal from '../components/ReviewModal';
import AppShell from '../layouts/AppShell';

const STATUS_LABEL: Record<Status, string> = {
  TO_READ: 'Plan to Read',
  READING: 'Currently Reading',
  FINISHED: 'Completed',
};

function BookshelfPage() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('AuthProvider not found');
    const { authFetch } = ctx;
  const [books, setBooks] = useState<UserBook[]>([]);
  const [editing, setEditing] = useState<UserBook | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    author: '',
    pages: 0,
    status: 'TO_READ' as Status,
    cover: '',
  });

  const load = () =>
    fetchUserBooks(authFetch)
      .then(setBooks)
      .catch((e) => setErr(e.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authFetch]);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await addBook(authFetch, form.title, form.author, form.pages, form.cover || null);

    if (form.status !== 'TO_READ') {
      const added = await fetchUserBooks(authFetch).then((all) =>
        all.find((b) => b.title === form.title && b.author === form.author)
      );
      if (added) await updateUserBook(authFetch, { id: added.id, status: form.status });
    }
    setForm({ title: '', author: '', pages: 0, status: 'TO_READ', cover: '' });
    load();
  }

  const changeStatus = (id: number, status: Status) =>
    updateUserBook(authFetch, { id, status }).then(load);

  const savePages = (id: number, pages: number) =>
    updateUserBook(authFetch, { id, pages_read: pages }).then(load);

  const remove = (id: number) => deleteUserBook(authFetch, id).then(load);

  const saveReview = async (rating: number, review: string) => {
    if (!editing) return;
    await updateUserBook(authFetch, { id: editing.id, rating, review });
    setEditing(null);
    load();
  };

  const autofill = (b: BookCandidate) =>
    setForm({
      ...form,
      title: b.title,
      author: b.author,
      pages: b.pages ?? 0,
      cover: b.cover ?? '',
    });

  return (
    <AppShell>
      {/* Add-book form ------------------------------------------------ */}
      <form
        onSubmit={handleAdd}
        className="mx-auto mb-10 max-w-xl space-y-4 rounded-xl border bg-white p-6 shadow dark:border-slate-700 dark:bg-slate-800"
      >
        <h2 className="text-lg font-semibold">Add a book</h2>
        <BookAutoComplete onSelect={autofill} />

        <div className="grid gap-2 sm:grid-cols-4">
          <input
            placeholder="Title"
            value={form.title}
            required
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded border p-2 sm:col-span-2 dark:border-slate-600 dark:bg-slate-900"
          />
          <input
            placeholder="Author"
            value={form.author}
            required
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="rounded border p-2 dark:border-slate-600 dark:bg-slate-900"
          />
          <input
            type="number"
            placeholder="Pages"
            min={0}
            value={form.pages || ''}
            onChange={(e) => setForm({ ...form, pages: +e.target.value || 0 })}
            className="rounded border p-2 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>

        <div className="flex items-center gap-4">
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
            className="rounded border px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="TO_READ">Plan to Read</option>
            <option value="READING">Currently Reading</option>
            <option value="FINISHED">Completed</option>
          </select>
          <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
            Add
          </button>
        </div>
      </form>

      {/* Section columns --------------------------------------------- */}
      {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
        <section key={s}>
          <h2 className="mb-2 text-xl font-semibold">{STATUS_LABEL[s]}</h2>
          <div className="book-grid">
            {books.filter((b) => b.status === s).length ? (
              books
                .filter((b) => b.status === s)
                .map((b) => (
                  <BookCard
                    key={b.id}
                    book={b}
                    borderClass={
                      s === 'TO_READ'
                        ? 'plan-to-read-card'
                        : s === 'READING'
                        ? 'currently-reading-card'
                        : 'completed-card'
                    }
                    onStatusChange={(st) => changeStatus(b.id, st)}
                    onDelete={() => remove(b.id)}
                    onOpenReview={() => setEditing(b)}
                    onProgress={(p) => savePages(b.id, p)}
                  />
                ))
            ) : (
              <p className="italic text-slate-500">Nothing in this section.</p>
            )}
          </div>
        </section>
      ))}

      {editing && (
        <ReviewModal book={editing} onSave={saveReview} onClose={() => setEditing(null)} />
      )}

      {err && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded bg-red-100 px-4 py-2 text-red-700 shadow dark:bg-red-900/80">
          {err}
        </div>
      )}
    </AppShell>
  );
}

export default BookshelfPage;
