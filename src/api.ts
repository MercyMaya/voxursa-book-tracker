/**********************************************************************
 *  Central API helpers (front-end)                                   *
 ********************************************************************/

/* ---------- shared types ---------------------------------------- */

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

/* ---------- JWT-aware fetch helper ------------------------------ */

export type AuthFetch = (
  path: string,
  init?: RequestInit
) => Promise<Response>;

export function makeAuthFetch(token: string | null): AuthFetch {
    return async (path, init = {}) => {
    const headers = new Headers(init.headers ?? {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');
        const rsp = await fetch(import.meta.env.VITE_API_BASE + path, {
            ...init,
            headers,
          });
      
          // if our token is bad/expired, force a log-out
          if (rsp.status === 401) {
            localStorage.removeItem('jwt');
            window.location.replace('/login');
            throw new Error('Session expired');
          }
          return rsp;
  };
}

/* ---------- CRUD helpers for user books ------------------------- */

export const fetchUserBooks = async (
    fetcher: AuthFetch
  ): Promise<UserBook[]> => {
    const rsp = await fetcher('/books/list.php');
    if (!rsp.ok) {
      const txt = await rsp.text();          // safest
      throw new Error(`API ${rsp.status}: ${txt.slice(0, 120)}…`);
    }
    return rsp.json();
  };

export const addBook = (
  fetcher: AuthFetch,
  title: string,
  author: string,
  pages: number,
  cover: string | null
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
    Pick<UserBook, 'status' | 'pages_read' | 'rating' | 'review'>
  > & { id: number }
) =>
  fetcher('/books/update.php', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });

export const deleteUserBook = (fetcher: AuthFetch, id: number) =>
  fetcher(`/books/delete.php?id=${id}`, { method: 'DELETE' });

/* ---------- Google Books search --------------------------------- */
interface GoogleItem {
    volumeInfo: {
      title: string;
      authors?: string[];
      pageCount?: number;
      imageLinks?: { thumbnail?: string };
    };
  }


export async function searchGoogleBooks(
  q: string
): Promise<BookCandidate[]> {
  if (!q) return [];
  const data = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`
  ).then((r) => r.json());
  if (!data.items) return [];
  return (data.items as GoogleItem[]).map((v) => ({
    title: v.volumeInfo.title,
    author: v.volumeInfo.authors?.[0] ?? '',
    pages: v.volumeInfo.pageCount,
    cover: v.volumeInfo.imageLinks?.thumbnail ?? '',
  }));
}


/* ---------- auth endpoints ------------------------------------ */
export async function register(email: string, password: string) {
  const res = await fetch(import.meta.env.VITE_API_BASE + '/register.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? 'Registration failed');
  }
}


/* ---------- auth: log-in --------------------------------------- */

export async function loginUser(
  email: string,
  password: string
): Promise<string> {
  const rsp = await fetch(import.meta.env.VITE_API_BASE + '/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!rsp.ok) {
    const { error } = await rsp.json();
    throw new Error(error ?? 'Login failed');
  }

  const { token } = (await rsp.json()) as { token: string };
  return token;
}