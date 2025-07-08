import './App.css';

import { WagmiProvider } from 'wagmi';
import wagmiConfig from '../wagmi.config';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './context/AuthContext';

import MainLayout from './layout/MainLayout';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MainLayout>
            <div>test</div>
          </MainLayout>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
