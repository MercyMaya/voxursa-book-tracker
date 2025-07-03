import {
  type FormEvent,
  useState,
  useContext,
} from 'react';
import { AuthContext } from '../contexts/AuthContext';
import {
  useNavigate,
  useLocation,
  Link,
  type Location,
} from 'react-router-dom';
import { loginUser } from '../api';

/* --------- type for location.state ----------------------------- */
interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider not mounted');

  const { login: setToken } = ctx;

  const navigate = useNavigate();
  const location = useLocation() as Location<LocationState>;
  const from = location.state?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const jwt = await loginUser(email, pw);
      setToken(jwt);                 // store in context / localStorage
      navigate(from, { replace: true });
    } catch (ex: unknown) {
      const msg = ex instanceof Error ? ex.message : 'Login failed';
      setErr(msg);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-bold">Sign in</h1>

        {err && <p className="rounded bg-red-100 p-2 text-red-700">{err}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full rounded border p-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Log in'}
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
