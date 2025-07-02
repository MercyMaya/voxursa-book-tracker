import { Moon, Sun, Menu } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dark, setDark] = useState(
    () => localStorage.getItem('theme') === 'dark',
  );
  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <div className={clsx('min-h-screen bg-slate-50 dark:bg-slate-900')}>
      {/* top-bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-white/80 px-4 py-3 shadow dark:bg-slate-800/80 backdrop-blur">
        <div className="flex items-center gap-2 text-lg font-bold">
          <Menu className="h-5 w-5 md:hidden" />
          Voxursa Book Tracker
        </div>
        <button
          onClick={toggle}
          className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="toggle theme"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </header>

      {/* main content */}
      <main className="mx-auto w-full max-w-4xl p-6">{children}</main>
    </div>
  );
}
