import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { token } = useContext(AuthContext);
  const loc = useLocation();
  return token ? <Outlet /> : <Navigate to="/login" state={{ from: loc }} />;
}
