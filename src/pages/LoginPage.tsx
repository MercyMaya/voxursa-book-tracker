import {
  type FormEvent,
  useContext,
  useState
} from 'react';
import {
  useNavigate,
  useLocation,
  Link,
  type Location
} from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

/* ------------------------------------------------------------------ *
 *  Helpers                                                            *
 * ------------------------------------------------------------------ */

interface LocationState {
  from?: Location['pathname'];
}

/* ------------------------------------------------------------------ *
 *  Page                                                               *
 * ------------------------------------------------------------------ */

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo =
    (location.state as LocationState | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email, pw);
      navigate(redirectTo, { replace: true });
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Login failed';
      setErr(msg);
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-bold text-center">Sign&nbsp;in</h1>

        {err && (
          <p className="rounded bg-red-100 p-2 text-red-700">{err}</p>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full rounded border p-2"
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          required
          className="w-full rounded border p-2"
        />

        <button
          disabled={busy}
          className="w-full rounded bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Log in'}
        </button>

        <p className="text-center text-sm">
          No account?{' '}
          <Link
            to="/register"
            className="text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
