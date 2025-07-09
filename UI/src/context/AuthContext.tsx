import type { ReactElement } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';

import type { User } from '../interface/User';

interface AuthContextType {
  user: User | null;
  status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting';
  login: () => void;
  logout: () => void;
}

interface AuthProviderType {
  children: ReactElement;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderType): ReactElement => {
  const [user, setUser] = useState<User | null>(null);
  const { address, balance, status, login, logout } = useWallet();

  useEffect(() => {
    if (status === 'disconnected' || !address) {
      setUser(null);
      return;
    }

    if (status === 'connected') {
      setUser({ address, balance });
    }
  }, [status, address, balance]);

  return (
    <AuthContext value={{ user, status, login, logout }}>
      {children}
    </AuthContext>
  );
};

/* eslint-disable react-refresh/only-export-components */
// TODO: remove the rule
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

const useWallet = () => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, status } = useAccount();
  const { data: balance } = useBalance({ address });

  const MetaMaskConnector = connectors[0];

  return {
    address,
    balance,
    status,
    login: () => connect({ connector: MetaMaskConnector }),
    logout: disconnect,
  };
};
