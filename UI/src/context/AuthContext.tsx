import type { PropsWithChildren, ReactElement } from 'react';
import { createContext, useContext } from 'react';

import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';

import type { User } from '../interface/User';

interface AuthContextType {
  user: User | null;
  connect: () => void;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren): ReactElement => {
  const account = useAccount();
  const { balance, connect, disconnect } = useWallet();

  let user: User | null = null;

  if (account.address) {
    user = {
      ...account,
      balance,
    };
  }

  return (
    <AuthContext value={{ user, connect, disconnect }}>{children}</AuthContext>
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
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  const MetaMaskConnector = connectors.find(
    (connector) => connector.name === 'MetaMask'
  );

  if (!MetaMaskConnector) {
    throw new Error('MetaMask connector not found');
  }

  return {
    balance,
    connect: () => connect({ connector: MetaMaskConnector }),
    disconnect: disconnect,
  };
};
