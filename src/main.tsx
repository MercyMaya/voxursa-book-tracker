/* ------------------------------------------------------------------ *
 *  App entry – React 18 + Vite                                       *
 * ------------------------------------------------------------------ */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

/* Context / route guards */
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

/* Pages */
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookshelfPage from './pages/BookshelfPage';
import MePage from './pages/MePage';

/* Global styles */
import './index.css';

/* Optional dark-mode preference ------------------------------------ */
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

/* ------------------------------------------------------------------ *
 *  Render                                                            *
 * ------------------------------------------------------------------ */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* `basename` ensures links work when the app lives under /booktracker/ */}
    <BrowserRouter basename="/booktracker">
      <AuthProvider>
        <Routes>
          {/* ---------- public ------------------------------------ */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ---------- private (JWT required) -------------------- */}
          <Route element={<ProtectedRoute />}>
            <Route index element={<BookshelfPage />} />
            <Route path="/me" element={<MePage />} />

            {/* Catch-all inside auth: unknown path → bookshelf */}
            <Route path="*" element={<BookshelfPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
