import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/* ------------------------------------------------------------------ *
 *  Types                                                              *
 * ------------------------------------------------------------------ */
interface Me {
  id: number;
  email: string;
  created_at: string;
}

/* ------------------------------------------------------------------ *
 *  Component                                                          *
 * ------------------------------------------------------------------ */
export default function MePage() {
  /* Auth helpers --------------------------------------------------- */
  const { authFetch, logout } = useAuth();

  /* Local state ---------------------------------------------------- */
  const [me,  setMe]  = useState<Me | null>(null);
  const [err, setErr] = useState<string | null>(null);

  /* Fetch profile once on mount ----------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const rsp = await authFetch('/me.php');
        if (!rsp.ok) throw new Error(`HTTP ${rsp.status}`);
        const data: Me = await rsp.json();
        setMe(data);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load profile';
        setErr(msg);
      }
    })();
  }, [authFetch]);

  /* Render --------------------------------------------------------- */
  if (err)  return <p className="m-8 text-red-700">Error: {err}</p>;
  if (!me)  return <p className="m-8">Loading…</p>;

  return (
    <div className="m-8 space-y-4">
      <h2 className="text-xl font-bold">Welcome, {me.email}</h2>
      <p>User&nbsp;ID: {me.id}</p>
      <p>
        Joined:{' '}
        {new Date(me.created_at).toLocaleDateString(undefined, {
          year:  'numeric',
          month: 'short',
          day:   'numeric',
        })}
      </p>
      <button
        onClick={logout}
        className="rounded bg-gray-300 px-3 py-1 hover:bg-gray-400"
      >
        Log&nbsp;out
      </button>
    </div>
  );
}
