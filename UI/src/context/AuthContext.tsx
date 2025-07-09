import type { ReactElement } from 'react';
import { createContext, useContext } from 'react';

import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import { getAccount } from 'wagmi/actions';
import config from '../../wagmi.config';

import type { User } from '../interface/User';

interface AuthContextType {
  user: User | null;
  connect: () => void;
  disconnect: () => void;
}

interface AuthProviderType {
  children: ReactElement;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderType): ReactElement => {
  const account = getAccount(config);
  const { balance, connect, disconnect } = useWallet();

  let user: User | null = null;

  if (account) {
    user = { ...account, balance };
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
