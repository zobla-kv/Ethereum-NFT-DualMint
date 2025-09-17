import { type PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();

  if (!user || user?.status === 'disconnected') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
