import { type PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const status = user?.status;

  if (!user || status === 'disconnected') {
    return <Navigate to='/' replace />;
  }

  if (status === 'reconnecting' || status === 'connecting') {
    // TODO: replace with spinner
    return <div>Checking authentication...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
