import { FormEvent, useState } from 'react';
import { register } from '../api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function handle(e: FormEvent) {
    e.preventDefault();
    try {
      await register(email, pw);
      setOk(true);
    } catch (ex: any) {
      setErr(ex.message);
    }
  }

  if (ok)
    return (
      <p className="m-8 text-center text-green-700">
        Registration complete – you can now <a href="/login" className="underline">log in</a>.
      </p>
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handle} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">Create account</h1>
        {err && <p className="rounded bg-red-100 p-2 text-red-700">{err}</p>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Email" className="w-full rounded border p-2" required />
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
          placeholder="Password (min 8 chars)" className="w-full rounded border p-2" required />
        <button className="w-full rounded bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700">
          Register
        </button>
      </form>
    </div>
  );
}
