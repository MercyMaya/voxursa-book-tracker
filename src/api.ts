/* ------------------------------------------------------------------ *
 *  Global API helper layer                                           *
 *  - Handles login, registration, JWT-aware fetch                    *
 *  - Book-shelf CRUD helpers                                         *
 * ------------------------------------------------------------------ */

const API_BASE = 'https://voxursa.com/booktracker/api';

/* ------------------------------------------------------------------ *
 *  Types                                                             *
 * ------------------------------------------------------------------ */
export type AuthFetch = <T = any>(
  path: string,
  opts?: RequestInit,
) => Promise<T>;

export type UserBook = {
  /* DB IDs */
  id: number;          // id in user_books
  book_id: number;     // FK to books

  /* Book fields from JOIN */
  title: string;
  author: string;
  cover_url: string | null;

  /* Per-user reading data */
  status: 'TO_READ' | 'READING' | 'FINISHED';
  pages_read: number;
  total_pages: number;
  rating: number | null;        // 1-5, added later
  review: string | null;
};

/* ------------------------------------------------------------------ *
 *  Authentication                                                    *
 * ------------------------------------------------------------------ */
export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return (await res.json()).token as string;
}

export async function register(
  email: string,
  password: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/register.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
}

/**
 * Factory that returns a fetch wrapper which automatically attaches
 * the Authorization header when a JWT is present.
 */
export function makeAuthFetch(token: string | null): AuthFetch {
  return async function authFetch<T = any>(
    path: string,
    opts: RequestInit = {},
  ): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opts.headers,
      },
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json() as Promise<T>;
  };
}

/* ------------------------------------------------------------------ *
 *  Book-shelf endpoints                                              *
 * ------------------------------------------------------------------ */

/** GET the caller’s full bookshelf */
export async function fetchUserBooks(authFetch: AuthFetch): Promise<UserBook[]> {
  return authFetch<UserBook[]>('/books/list.php');
}

/** PUT a new entry on the caller’s shelf */
export async function addBook(
  authFetch: AuthFetch,
  title: string,
  author: string,
  pages: number,
): Promise<void> {
  await authFetch('/books/add.php', {
    method: 'POST',
    body: JSON.stringify({ title, author, total_pages: pages }),
  });
}

/** PATCH a single user_books row */
export async function updateUserBook(
  authFetch: AuthFetch,
  payload: Partial<UserBook> & { id: number },
): Promise<void> {
  await authFetch('/books/update.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** DELETE a single user_books row */
export async function deleteUserBook(
  authFetch: AuthFetch,
  id: number,
): Promise<void> {
  await authFetch(`/books/delete.php?id=${id}`, { method: 'DELETE' });
}
