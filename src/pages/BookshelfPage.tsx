/* ------------------------------------------------------------------ *
 *  BookshelfPage                                                     *
 * ------------------------------------------------------------------ */

import {
  useContext,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from 'react';

import {
  fetchUserBooks,
  updateUserBook,
  deleteUserBook,
  addBook,
  type UserBook,
  type BookCandidate,
} from '../api';

import { AuthContext } from '../contexts/AuthContext';
import BookAutoComplete from '../components/BookAutoComplete';
import BookCard from '../components/BookCard';
import ReviewModal from '../components/ReviewModal';
import AppShell from '../layouts/AppShell';

/* ------------------------------------------------------------------ *
 *  Helpers                                                           *
 * ------------------------------------------------------------------ */

type Status = UserBook['status'];

const STATUS_LABEL: Record<Status, string> = {
  'TO_READ': 'Plan to Read',
  'READING': 'Currently Reading',
  'FINISHED': 'Completed',
};

/* ------------------------------------------------------------------ *
 *  Page component                                                    *
 * ------------------------------------------------------------------ */

const BookshelfPage = () => {
  const { authFetch } = useContext(AuthContext);

  const [books, setBooks] = useState<UserBook[]>([]);
  const [editing, setEditing] = useState<UserBook | null>(null);
  const [err, setErr] = useState<string | null>(null);

  /* ----- add-book form state ------------------------------------ */
  const [form, setForm] = useState({
    title: '',
    author: '',
    pages: 0,
    status: 'TO_READ' as Status,
    cover: '',
  });

  /* ----- initial load ------------------------------------------- */
  const load = () =>
    fetchUserBooks(authFetch)
      .then(setBooks)
      .catch((e) => setErr(e.message));

  useEffect(() => {
    load();
  }, [authFetch]);

  /* ----- add book ------------------------------------------------ */
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await addBook(
      authFetch,
      form.title,
      form.author,
      form.pages,
      form.cover || null,
    );

    /* optional status change after add */
    if (form.status !== 'TO_READ') {
      const { id } = await fetchUserBooks(authFetch).then((all) =>
        // find newest match
        all.find(
          (b) => b.title === form.title && b.author === form.author,
        )!,
      );
      await updateUserBook(authFetch, { id, status: form.status });
    }

    setForm({ title: '', author: '', pages: 0, status: 'TO_READ', cover: '' });
    load();
  }

  /* ----- CRUD helpers ------------------------------------------- */
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

  /* ----- autocomplete handler ----------------------------------- */
  const autofill = (b: BookCandidate) =>
    setForm({
      ...form,
      title: b.title,
      author: b.author,
      pages: b.pages ?? 0,
      cover: b.cover ?? '',
    });

  /* ---------------------------------------------------------------- */

  return (
    <AppShell>
      {/* ------------ add-book card ------------------------------ */}
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
            min={0}
            className="rounded border p-2 dark:border-slate-600 dark:bg-slate-900"
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
            <option value="TO_READ">Plan to Read</option>
            <option value="READING">Currently Reading</option>
            <option value="FINISHED">Completed</option>
          </select>

          <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
            Add
          </button>
        </div>
      </form>

      {/* ------------ section grids ------------------------------ */}
      {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
        <Section
          key={s}
          label={STATUS_LABEL[s]}
          books={books.filter((b) => b.status === s)}
          borderClass={
            s === 'TO_READ'
              ? 'plan-to-read-card'
              : s === 'READING'
              ? 'currently-reading-card'
              : 'completed-card'
          }
          onStatus={changeStatus}
          onProgress={savePages}
          onRemove={remove}
          onReview={(b) => setEditing(b)}
        />
      ))}

      {/* ------------ review modal ------------------------------ */}
      {editing && (
        <ReviewModal
          book={editing}
          onSave={saveReview}
          onClose={() => setEditing(null)}
        />
      )}

      {/* ------------ error banner ------------------------------ */}
      {err && (
        <p className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded bg-red-100 px-4 py-2 text-red-700 shadow dark:bg-red-900/80">
          {err}
        </p>
      )}
    </AppShell>
  );
};

/* ------------------------------------------------------------------ *
 *  Section component (grid)                                          *
 * ------------------------------------------------------------------ */

interface SectionProps {
  label: string;
  books: UserBook[];
  borderClass: string;
  onStatus: (id: number, s: Status) => void;
  onProgress: (id: number, pages: number) => void;
  onRemove: (id: number) => void;
  onReview: (b: UserBook) => void;
}

const Section = ({
  label,
  books,
  borderClass,
  onStatus,
  onProgress,
  onRemove,
  onReview,
}: SectionProps) => (
  <>
    <h2 className="mb-2 mt-8 text-xl font-semibold">{label}</h2>
    <div className="book-grid">
      {books.length ? (
        books.map((b) => (
          <BookCard
            key={b.id}
            book={b}
            borderClass={borderClass}
            onStatusChange={(s) => onStatus(b.id, s as Status)}
            onDelete={() => onRemove(b.id)}
            onOpenReview={() => onReview(b)}
            onProgress={(p) => onProgress(b.id, p)}
          />
        ))
      ) : (
        <p className="placeholder italic text-slate-500">
          Nothing in this section.
        </p>
      )}
    </div>
  </>
);

/* ------------------------------------------------------------------ *
 *  Default export                                                    *
 * ------------------------------------------------------------------ */

export default BookshelfPage;
