/* ------------------------------------------------------------------ *
 *  Configuration                                                     *
 * ------------------------------------------------------------------ */

/** Remote PHP API root */
export const API_BASE = 'https://voxursa.com/booktracker/api';

/* ------------------------------------------------------------------ *
 *  Generic JWT-aware fetch type                                      *
 * ------------------------------------------------------------------ */
export type AuthFetch = <T = any>(
  path: string,
  opts?: RequestInit,
) => Promise<T>;

/* ------------------------------------------------------------------ *
 *  Data models                                                       *
 * ------------------------------------------------------------------ */
export type UserBook = {
  id: number;
  book_id: number;
  title: string;
  author: string;
  cover_url: string | null;
  status: 'TO_READ' | 'READING' | 'FINISHED';
  pages_read: number;
  total_pages: number;
  rating: number | null;
  review: string | null;
};

/* ------------------------------------------------------------------ *
 *  Authentication helpers                                            *
 * ------------------------------------------------------------------ */
export async function login(
  email: string,
  password: string,
): Promise<string> {
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

/** Factory: returns fetch wrapper that auto-adds JWT and JSON handling */
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
 *  Bookshelf endpoints                                               *
 * ------------------------------------------------------------------ */

export async function fetchUserBooks(
  authFetch: AuthFetch,
): Promise<UserBook[]> {
  return authFetch<UserBook[]>('/books/list.php');
}

export async function addBook(
  authFetch: AuthFetch,
  title: string,
  author: string,
  pages: number,
  cover: string | null,
): Promise<void> {
  await authFetch('/books/add.php', {
    method: 'POST',
    body: JSON.stringify({
      title,
      author,
      total_pages: pages,
      cover_url: cover,
    }),
  });
}

export async function updateUserBook(
  authFetch: AuthFetch,
  payload: Partial<UserBook> & { id: number },
): Promise<void> {
  await authFetch('/books/update.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteUserBook(
  authFetch: AuthFetch,
  id: number,
): Promise<void> {
  await authFetch(`/books/delete.php?id=${id}`, { method: 'DELETE' });
}


/* ------------------------------------------------------------------ *
 *  Google Books lookup (autocomplete)                                *
 * ------------------------------------------------------------------ */

export type BookCandidate = {
  title: string;
  author: string;
  pages: number | null;
  cover: string | null;
};

const G_API = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Live search (maxResults = 10).  Requires env var VITE_GBOOKS_KEY.
 */
export async function searchGoogleBooks(
  query: string,
): Promise<BookCandidate[]> {
  if (!query.trim()) return [];

  const key = import.meta.env.VITE_GBOOKS_KEY;
  const url =
    `${G_API}?q=${encodeURIComponent(query)}` +
    `&maxResults=10&fields=items(volumeInfo(title,authors,pageCount,imageLinks/thumbnail))` +
    (key ? `&key=${key}` : '');

  const res = await fetch(url);
  const json = await res.json();

  return (json.items ?? []).map((it: any) => {
    const v = it.volumeInfo;
    return {
      title: v.title,
      author: (v.authors ?? [''])[0],
      pages: v.pageCount ?? null,
      cover: v.imageLinks?.thumbnail ?? null,
    } as BookCandidate;
  });
}
