import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MePage from './pages/MePage';
import { ArrowPathIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    // Check token existence on init
    return !!localStorage.getItem('token');
  });

  // Simple effect to handle global 401 errors (if desired)
  useEffect(() => {
    // You could listen for custom event or state change to trigger logout on token invalid
    // (Alternatively, handle in fetchBooks catch inside MePage)
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      {/** Navigation bar */}
      {isLoggedIn && (
        <header className="w-full bg-gray-800 text-gray-100">
          <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Voxursa Book Tracker</h1>
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 rounded hover:bg-gray-700 transition"
                title="Refresh books"
                onClick={() => {
                  // Optionally trigger a refresh event or state update
                  // Here we use the browser's navigation to refresh the MePage component
                  window.location.reload();
                }}
              >
                <ArrowPathIcon className="h-6 w-6" />
              </button>
              <button 
                className="p-2 rounded hover:bg-gray-700 transition"
                title="Logout"
                onClick={handleLogout}
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </nav>
        </header>
      )}

      <Routes>
        <Route 
          path="/" 
          element={
            isLoggedIn 
              ? <MePage /> 
              : <Navigate to="/login" replace /> 
          } 
        />
        <Route 
          path="/login" 
          element={<LoginPage onLogin={() => setIsLoggedIn(true)} />} 
        />
        <Route 
          path="/register" 
          element={<RegisterPage />} 
        />
        <Route 
          path="*"
          element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
