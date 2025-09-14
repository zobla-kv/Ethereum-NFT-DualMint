import { type PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner/Spinner';

const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const status = user?.status;

  if (!user || status === 'disconnected') {
    return <Navigate to="/" replace />;
  }

  if (status === 'reconnecting' || status === 'connecting') {
    return (
      <div className="fixed flex items-center justify-center min-h-screen">
        <Spinner size={100} />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
