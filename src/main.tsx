/* ------------------------------------------------------------------ *
 *  App entry - React 19 + Vite                                       *
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

/* Fallback shell (future dashboard / 404 etc.) */
import App from './App';

/* Global styles (Tailwind directives live in index.css) */
import './index.css';

/* ------------------------------------------------------------------ *
 *  Render                                                            *
 * ------------------------------------------------------------------ */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes ------------------------------------------------ */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes (JWT required) ----------------------------- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<BookshelfPage />} />
            <Route path="/me" element={<MePage />} />

            {/* Catch-all for future authenticated sub-pages */}
            <Route path="/*" element={<App />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
