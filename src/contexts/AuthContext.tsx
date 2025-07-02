import {
  createContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, makeAuthFetch, API_BASE } from '../api';
import type { AuthFetch } from '../api';

/* ------------------------------------------------------------------ *
 *  Shape of the auth context                                         *
 * ------------------------------------------------------------------ */
interface AuthCtx {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  authFetch: AuthFetch;
}

/* ------------------------------------------------------------------ *
 *  Safe default (before provider mounts)                             *
 * ------------------------------------------------------------------ */
export const AuthContext = createContext<AuthCtx>({
  token: null,
  login: async () => {
    throw new Error('AuthProvider not mounted yet');
  },
  logout: () => undefined,
  authFetch: async () => {
    throw new Error('AuthProvider not mounted yet');
  },
});

/* ------------------------------------------------------------------ *
 *  Provider                                                           *
 * ------------------------------------------------------------------ */
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();          // <— we need this now
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('jwt') ?? null,
  );

  /* ---- helpers --------------------------------------------------- */
  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    setToken(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const login = useCallback(
    async (email: string, password: string) => {
      const t = await apiLogin(email, password);
      localStorage.setItem('jwt', t);
      setToken(t);
      navigate('/', { replace: true });    // go home after successful login
    },
    [navigate],
  );

  /* ---- JWT-aware fetch with auto-logout on 401 ------------------- */
  const authFetch = useMemo<AuthFetch>(() => {
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

      /* Auto-logout on any 401 */
      if (res.status === 401) {
        logout();
        throw new Error('Session expired – please sign in again.');
      }

      if (!res.ok) throw new Error((await res.json()).error);
      return res.json() as Promise<T>;
    };
  }, [token, logout]);

  /* ---- render ---------------------------------------------------- */
  return (
    <AuthContext.Provider value={{ token, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}
