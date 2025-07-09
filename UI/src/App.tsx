import './App.css';

import { WagmiProvider } from 'wagmi';
import wagmiConfig from '../wagmi.config';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './context/AuthContext';

import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
