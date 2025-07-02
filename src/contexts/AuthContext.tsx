import { createContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../api';

interface AuthCtx {
  token: string | null;
  login: (e: string, p: string) => Promise<void>;
  logout: () => void;
}
export const AuthContext = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('jwt') ?? null,
  );

  async function login(email: string, password: string) {
    const t = await apiLogin(email, password);
    localStorage.setItem('jwt', t);
    setToken(t);
  }
  function logout() {
    localStorage.removeItem('jwt');
    setToken(null);
  }
  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
