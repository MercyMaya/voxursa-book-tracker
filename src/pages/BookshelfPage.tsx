/* ------------------------------------------------------------------ *
 *  BookshelfPage – modern card layout                                *
 * ------------------------------------------------------------------ */

import { useContext, useEffect, useState } from 'react';
import type { BookCandidate, UserBook } from '../api';
import {
  fetchUserBooks,
  addBook,
  updateUserBook,
  deleteUserBook,
} from '../api';
import { AuthContext } from '../contexts/AuthContext';
import EditReviewDialog from '../components/EditReviewDialog';
import BookAutoComplete from '../components/BookAutoComplete';
import BookCard from '../components/BookCard';
import AppShell from '../layouts/AppShell';

type Status = UserBook['status'];

/* ------------------------------------------------------------------ *
 *  Page                                                               *
 * ------------------------------------------------------------------ */
export default function BookshelfPage() {
  const { authFetch } = useContext(AuthContext);

  const [books, setBooks] = useState<UserBook[]>([]);
  const [form, setForm] = useState({
    title: '',
    author: '',
    pages: 0,
    status: 'TO_READ' as Status,
    cover: '',
  });
  const [editing, setEditing] = useState<UserBook | null>(null);
  const [err, setErr] = useState<string | null>(null);

  /* -------- initial & refresh load -------------------------------- */
  const load = () =>
    fetchUserBooks(authFetch)
      .then(setBooks)
      .catch((e) => setErr(e.message));
  useEffect(() => {
    load();
  }, [authFetch]);

  /* -------- CRUD helpers ----------------------------------------- */
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    await addBook(
      authFetch,
      form.title,
      form.author,
      form.pages,
      form.cover || null,
    );

    /* move to chosen status if not TO_READ */
    if (form.status !== 'TO_READ') {
      await load();
      const added = books.find(
        (b) => b.title === form.title && b.author === form.author,
      );
      if (added) {
        await updateUserBook(authFetch, { id: added.id, status: form.status });
      }
    }

    setForm({ title: '', author: '', pages: 0, status: 'TO_READ', cover: '' });
    load();
  }

  const changeStatus = (id: number, s: Status) =>
    updateUserBook(authFetch, { id, status: s }).then(load);
  const savePages = (id: number, pages_read: number) =>
    updateUserBook(authFetch, { id, pages_read }).then(load);
  const remove = (id: number) => deleteUserBook(authFetch, id).then(load);

  const saveReview = async (rating: number, review: string) => {
    if (!editing) return;
    await updateUserBook(authFetch, { id: editing.id, rating, review });
    setEditing(null);
    load();
  };

  /* -------- autocomplete handler --------------------------------- */
  function autofill(b: BookCandidate) {
    setForm({
      ...form,
      title: b.title,
      author: b.author,
      pages: b.pages ?? 0,
      cover: b.cover ?? '',
    });
  }

  /* ---------------------------------------------------------------- */

  return (
    <AppShell>
      {/* ----- Add-book form -------------------------------------- */}
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
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="rounded border p-2 sm:col-span-2 dark:border-slate-600 dark:bg-slate-900"
          />
          <input
            placeholder="Author"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            required
            className="rounded border p-2 dark:border-slate-600 dark:bg-slate-900"
          />
          <input
            type="number"
            placeholder="Pages"
            value={form.pages || ''}
            onChange={(e) =>
              setForm({ ...form, pages: +e.target.value || 0 })
            }
            className="rounded border p-2 dark:border-slate-600 dark:bg-slate-900"
            min={0}
          />
        </div>

        <div className="flex items-center gap-4">
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as Status })
            }
            className="rounded border px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
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

      {/* ----- Books grid ----------------------------------------- */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((b) => (
          <BookCard
            key={b.id}
            book={b}
            onRemove={() => remove(b.id)}
            onStatus={(s) => changeStatus(b.id, s)}
            onProgress={(p) => savePages(b.id, p)}
            onReview={() => setEditing(b)}
          />
        ))}
      </div>

      {/* ---- Review dialog --------------------------------------- */}
      {editing && (
        <EditReviewDialog
          book={editing}
          onSave={saveReview}
          onClose={() => setEditing(null)}
        />
      )}

      {/* ---- Error snackbar -------------------------------------- */}
      {err && (
        <p className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded bg-red-100 px-4 py-2 text-red-700 shadow dark:bg-red-900/80">
          {err}
        </p>
      )}
    </AppShell>
  );
}
