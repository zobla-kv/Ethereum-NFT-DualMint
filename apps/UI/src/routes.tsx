import { createBrowserRouter, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import NotFound from './pages/NotFound';
import HomePage from './pages/HomePage/HomePage';
import ChainPage from './pages/ChainPage/ChainPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/chain',
    element: <Navigate to="/chain/[null]" replace />,
  },
  {
    path: '/chain/:chainName',
    element: (
      <ProtectedRoute>
        <ChainPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
