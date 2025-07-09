import { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

// TODO: protect from direct url access
const ProtectedRoute = (): ReactNode => {
  const { user } = useAuth();
  const status = user?.status;

  if (status === 'reconnecting' || status === 'connecting') {
    // TODO: replace with spinner
    return <div>Checking authentication...</div>;
  }

  if (status === 'disconnected') {
    return <Navigate to='/' replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
