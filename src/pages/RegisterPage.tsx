import { type FormEvent, useState } from 'react';
import { register } from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [pw,    setPw]    = useState('');
  const [err,   setErr]   = useState<string | null>(null);
  const [busy,  setBusy]  = useState(false);

  async function handle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await register({ name, email, password: pw });
      navigate('/login', { replace: true, state: { regOk: true } });
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Registration failed';
      setErr(msg);
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form
        onSubmit={handle}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-bold text-center">Create&nbsp;account</h1>

        {err && (
          <p className="rounded bg-red-100 p-2 text-red-700">{err}</p>
        )}

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display name"
          className="w-full rounded border p-2"
          required
        />
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
          placeholder="Password (min 8 chars)"
          minLength={8}
          className="w-full rounded border p-2"
          required
        />

        <button
          disabled={busy}
          className="w-full rounded bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? 'Creating…' : 'Register'}
        </button>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
