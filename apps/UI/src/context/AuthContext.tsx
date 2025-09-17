import {
  createContext,
  useContext,
  type PropsWithChildren,
  type ReactElement,
} from 'react';

import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  type Connector,
} from 'wagmi';

import type { User } from '../interface/User';

import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  connectors: readonly Connector[];
  connect: (connector: Connector) => void;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren): ReactElement => {
  const { account, balance, connectors, connect, disconnect } = useWallet();

  let user: User | null = null;

  if (account.address) {
    user = {
      ...account,
      balance,
    };
  }

  return (
    <AuthContext value={{ user, connectors, connect, disconnect }}>
      {children}
    </AuthContext>
  );
};

/* eslint-disable react-refresh/only-export-components */
// TODO: remove eslint rule
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

const useWallet = () => {
  const account = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  const handleConnect = (connector: Connector) => {
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    if (isMobile && !window.ethereum) {
      toast(
        'Please open this site in the MetaMask Mobile browser to connect. Other browsers are not supported.'
      );
      return;
    }

    connect(
      { connector },
      {
        onSuccess: () => toast.success('Wallet connected.'),
        onError: () =>
          toast.error('Error connecting wallet. Please try again.'),
      }
    );
  };

  return {
    account,
    balance,
    connectors,
    connect: handleConnect,
    disconnect,
  };
};
