/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { makeAuthFetch, type AuthFetch } from '../api';

/* ---------- context shape ------------------------------------- */
interface AuthCtx {
  token: string | null;
  login: (t: string) => void;
  logout: () => void;
  authFetch: AuthFetch;
}

/* ---------- context instance ---------------------------------- */
export const AuthContext = createContext<AuthCtx | null>(null);

/* ---------- provider ------------------------------------------ */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('jwt') ?? null
  );

  const authFetch: AuthFetch = useMemo(
    () => makeAuthFetch(token),
    [token]
  );

  const login = useCallback((t: string) => {
    localStorage.setItem('jwt', t);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
