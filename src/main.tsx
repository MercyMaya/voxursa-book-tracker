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

/* Fallback shell */
import App from './App';

/* Global styles */
import './index.css';

/* ------------------------------------------------------------------ *
 *  Render                                                            *
 * ------------------------------------------------------------------ */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Router must wrap AuthProvider so useNavigate() works */}
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes ------------------------------------------ */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes (JWT required) ------------------------ */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<BookshelfPage />} />
            <Route path="/me" element={<MePage />} />
            {/* future authenticated routes */}
            <Route path="/*" element={<App />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
