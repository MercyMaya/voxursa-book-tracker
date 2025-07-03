/**********************************************************************
 *  Central front-end API helper                                       *
 *  – combines legacy “PHP” endpoints used by the UI and new REST      *
 *    endpoints you’re migrating to.                                   *
 *********************************************************************/

const API_BASE = import.meta.env.VITE_API_BASE ?? ''; // e.g. https://voxursa.com/booktracker/api

/* ------------------------------------------------------------------ */
/*  Shared domain types                                               */
/* ------------------------------------------------------------------ */

export type Status = 'TO_READ' | 'READING' | 'FINISHED';

export interface UserBook {
  id: number;
  title: string;
  author: string;
  total_pages?: number;
  pages_read: number;
  cover_url?: string | null;
  status: Status;
  rating?: number;
  review?: string;
}

export interface BookCandidate {
  title: string;
  author: string;
  pages?: number;
  cover?: string;
}

/* ------------------------------------------------------------------ */
/*  Token helpers                                                     */
/* ------------------------------------------------------------------ */

function getToken(): string | null {
  return localStorage.getItem('token');
}
function setToken(t: string | null) {
  if (t) localStorage.setItem('token', t);
  else   localStorage.removeItem('token');
}

/* ------------------------------------------------------------------ */
/*  JWT-aware fetch wrapper (legacy UI expects this)                   */
/* ------------------------------------------------------------------ */

export type AuthFetch = (path: string, init?: RequestInit) => Promise<Response>;

export function makeAuthFetch(token: string | null): AuthFetch {
  return async (path, init = {}) => {
    const headers = new Headers(init.headers ?? {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');

    const rsp = await fetch(`${API_BASE}${path}`, { ...init, headers });

    /* If our stored token is bad/expired force a log-out redirect       */
    if (rsp.status === 401) {
      setToken(null);
      window.location.replace('/login');
      return Promise.reject(new Error('Session expired'));
    }
    return rsp;
  };
}

/* ------------------------------------------------------------------ */
/*  “PHP” endpoints used by the bookshelf UI                           */
/* ------------------------------------------------------------------ */

export const fetchUserBooks = async (fetcher: AuthFetch): Promise<UserBook[]> =>
  fetcher('/books/list.php').then(r => r.json());

export const addBook = (
  fetcher: AuthFetch,
  title: string,
  author: string,
  pages: number,
  cover: string | null,
) =>
  fetcher('/books/add.php', {
    method: 'POST',
    body: JSON.stringify({
      title,
      author,
      total_pages: pages || undefined,
      cover,
    }),
  });

export const updateUserBook = (
  fetcher: AuthFetch,
  patch: Partial<
    Pick<UserBook, 'id' | 'status' | 'pages_read' | 'rating' | 'review'>
  > & { id: number },
) =>
  fetcher('/books/update.php', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });

export const deleteUserBook = (fetcher: AuthFetch, id: number) =>
  fetcher(`/books/delete.php?id=${id}`, { method: 'DELETE' });

/* Google Books quick-search (for Add-Book auto-fill) */
export async function searchGoogleBooks(q: string): Promise<BookCandidate[]> {
  if (!q.trim()) return [];
  const data = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`,
  ).then(r => r.json());

  if (!data.items) return [];
  return data.items.map((v: any): BookCandidate => ({
    title : v.volumeInfo.title,
    author: v.volumeInfo.authors?.[0] ?? '',
    pages : v.volumeInfo.pageCount,
    cover : v.volumeInfo.imageLinks?.thumbnail ?? '',
  }));
}

/* ------------------------------------------------------------------ */
/*  New REST-style endpoints you started adding                        */
/* ------------------------------------------------------------------ */

export async function loginUser(email: string, password: string) {
  const rsp = await fetch(`${API_BASE}/auth/login`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ email, password }),
  });
  if (!rsp.ok) throw new Error('Login failed');
  const data = await rsp.json();
  if (data.token) setToken(data.token);
  return data;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const rsp = await fetch(`${API_BASE}/auth/register`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ name, email, password }),
  });
  if (!rsp.ok) throw new Error('Registration failed');
  return rsp.json();
}

/* Generic helper used by the REST functions below */
async function restFetch<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers ?? {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  const rsp = await fetch(url, { ...init, headers });
  if (rsp.status === 401) throw new Error('Unauthorized');
  if (!rsp.ok) throw new Error(`HTTP ${rsp.status}`);
  return rsp.json();
}

export async function fetchBooks(): Promise<BookData[]> {
  return restFetch<BookData[]>(`${API_BASE}/books`);
}

export interface BookData {
  id?: number;
  title: string;
  author: string;
  pages?: number;
  status: 'plan' | 'reading' | 'completed';
  cover?: string;
  rating?: number;
  review?: string;
}

export function createBook(book: BookData) {
  return restFetch<BookData>(`${API_BASE}/books`, {
    method: 'POST',
    body  : JSON.stringify(book),
  });
}

export function updateBook(bookId: number, updates: Partial<BookData>) {
  return restFetch<BookData>(`${API_BASE}/books/${bookId}`, {
    method: 'PUT',
    body  : JSON.stringify(updates),
  });
}

export function deleteBook(bookId: number) {
  return restFetch<void>(`${API_BASE}/books/${bookId}`, { method: 'DELETE' });
}

/* ------------------------------------------------------------------ */
/*  Convenience – one default fetcher for components that want it      */
/* ------------------------------------------------------------------ */

export const authFetch: AuthFetch = makeAuthFetch(getToken());
