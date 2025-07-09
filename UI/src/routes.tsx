import { createBrowserRouter } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import NotFound from './pages/NotFound';
import HomePage from './pages/HomePage';
import ChainPage from './pages/ChainPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/chain',
    element: <ProtectedRoute />,
    children: [
      {
        path: ':network',
        element: <ChainPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
