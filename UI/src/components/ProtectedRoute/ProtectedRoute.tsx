import { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = (): ReactNode => {
  const { user, status } = useAuth();

  if (status === 'reconnecting' || status === 'connecting') {
    // TODO: replace with spinner
    return <div>Checking authentication...</div>;
  }

  if (!user && status !== 'connected') {
    return <Navigate to='/' replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
