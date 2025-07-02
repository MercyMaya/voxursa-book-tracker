import {
    createContext,
    useState,
    useCallback,
    useMemo,
    ReactNode,
  } from 'react';
  import { login as apiLogin, makeAuthFetch, AuthFetch } from '../api';
  
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
   *  Create the context with safe fall-back implementations            *
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
   *  Provider component                                                *
   * ------------------------------------------------------------------ */
  export function AuthProvider({ children }: { children: ReactNode }) {
    /* Persist the JWT in localStorage so a refresh keeps the session */
    const [token, setToken] = useState<string | null>(
      () => localStorage.getItem('jwt') ?? null,
    );
  
    /* Re-create the helper whenever the token changes */
    const authFetch = useMemo<AuthFetch>(() => makeAuthFetch(token), [token]);
  
    /* ---- callbacks ------------------------------------------------- */
    const login = useCallback(async (email: string, password: string) => {
      const t = await apiLogin(email, password);
      localStorage.setItem('jwt', t);
      setToken(t);
    }, []);
  
    const logout = useCallback(() => {
      localStorage.removeItem('jwt');
      setToken(null);
    }, []);
  
    /* ---- render ---------------------------------------------------- */
    return (
      <AuthContext.Provider value={{ token, login, logout, authFetch }}>
        {children}
      </AuthContext.Provider>
    );
  }
  