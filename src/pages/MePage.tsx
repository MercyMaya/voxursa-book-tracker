import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';

interface Me {
  id: number;
  email: string;
  created_at: string;
}

export default function MePage() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('AuthProvider not mounted');
    const { authFetch, logout } = ctx;
  const [me, setMe] = useState<Me | null>(null);
  const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        authFetch('/me.php')
          .then((r) => r.json())
          .then(setMe)
          .catch((e: unknown) => {
            const msg = e instanceof Error ? e.message : 'Failed to load profile';
            setErr(msg);
          });
      }, [authFetch]);

  if (err) return <p className="m-8 text-red-700">Error: {err}</p>;
  if (!me) return <p className="m-8">Loading…</p>;

  return (
    <div className="m-8 space-y-4">
      <h2 className="text-xl font-bold">Welcome, {me.email}</h2>
      <p>User ID: {me.id}</p>
      <p>Joined: {new Date(me.created_at).toLocaleDateString()}</p>
      <button
        onClick={logout}
        className="rounded bg-gray-300 px-3 py-1 hover:bg-gray-400"
      >
        Log out
      </button>
    </div>
  );
}
