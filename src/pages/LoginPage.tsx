/* ------------------------------------------------------------------ *
 *  LoginPage                                                         *
 * ------------------------------------------------------------------ */

import { type FormEvent, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser } from '../api';

/** Typed shape of `location.state` when we were redirected here */
interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage() {
  /* ---------------------------------------------------------------- *
   *  Router helpers                                                   *
   * ---------------------------------------------------------------- */
  const navigate  = useNavigate();
  const location  = useLocation();
  /* Where the user originally tried to go (default = “/”) */
  const from = (location.state as LocationState)?.from?.pathname ?? '/';

  /* ---------------------------------------------------------------- *
   *  Local component state                                           *
   * ---------------------------------------------------------------- */
  const [email, setEmail] = useState('');
  const [pw,    setPw   ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy,  setBusy ] = useState(false);

  /* ---------------------------------------------------------------- *
   *  Submit handler                                                  *
   * ---------------------------------------------------------------- */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await loginUser(email, pw);           // stores JWT token internally
      navigate(from, { replace: true });    // go to intended page
    } catch (err: unknown) {
      /* Narrow-typed error handling without `any` */
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      setBusy(false);
    }
  }

  /* ---------------------------------------------------------------- *
   *  JSX                                                             *
   * ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-bold text-center">Sign&nbsp;in</h1>

        {error && (
          <p className="rounded bg-red-100 p-2 text-red-700">{error}</p>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded border p-2"
          required
        />

        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          className="w-full rounded border p-2"
          required
        />

        <button
          disabled={busy}
          className="w-full rounded bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Log in'}
        </button>

        <p className="text-center text-sm">
          No account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
