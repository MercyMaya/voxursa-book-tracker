/* ------------------------------------------------------------------ *
 *  AuthContext – JWT / session handling                              *
 * ------------------------------------------------------------------ */

import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from 'react';
import { makeAuthFetch, type AuthFetch } from '../api';

/* ------------------------------------------------------------------ *
 *  Types                                                              *
 * ------------------------------------------------------------------ */

export type AuthCtx = {
  token: string | null;
  /** Store token in state + localStorage */
  login: (t: string) => void;
  /** Remove token from both places */
  logout: () => void;
  /** Fetch helper that automatically adds Bearer token */
  authFetch: AuthFetch;
};

/* ------------------------------------------------------------------ *
 *  Create context                                                     *
 * ------------------------------------------------------------------ */

const AuthContext = createContext<AuthCtx | null>(null);

/* ------------------------------------------------------------------ *
 *  Hook – the *only* safe way to consume the context                  *
 * ------------------------------------------------------------------ */
/* eslint-disable-next-line react-refresh/only-export-components */
export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth() must be used inside <AuthProvider>');
  return ctx;
}

/* ------------------------------------------------------------------ *
 *  Provider                                                           *
 * ------------------------------------------------------------------ */

interface ProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: ProviderProps) {
  /* ----- token state -------------------------------------------- */
  const [token, setToken] = useState<string | null>(() => {
    // restore token (if any) on first render
    return localStorage.getItem('token');
  });

  /* ----- login / logout helpers --------------------------------- */
  const login = (t: string) => {
    localStorage.setItem('token', t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  /* ----- auth-aware fetch --------------------------------------- */
  const authFetch = useMemo<AuthFetch>(() => makeAuthFetch(token), [token]);

  /* ----- context value ------------------------------------------ */
  const value: AuthCtx = { token, login, logout, authFetch };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
