import type { ReactElement } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';

import type { User } from '../interface/User';

interface AuthContextType {
  isConnected: boolean;
  isPending: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
}

interface AuthProviderType {
  children: ReactElement;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderType): ReactElement => {
  const [user, setUser] = useState<User | null>(null);

  const { isConnected, isPending, address, balance, login, logout } =
    useWallet();

  useEffect(() => {
    if (!isConnected || !address || !balance) {
      setUser(null);
      return;
    }

    setUser({ address, balance });
  }, [isConnected, address, balance]);

  return (
    <AuthContext value={{ isConnected, isPending, user, login, logout }}>
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
  const { connect, connectors, isPending } = useConnect({});
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const MetaMaskConnector = connectors[0];

  return {
    address,
    balance,
    isConnected,
    isPending,
    login: () => connect({ connector: MetaMaskConnector }),
    logout: disconnect,
  };
};
