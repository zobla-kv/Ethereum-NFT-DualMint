import type { ReactElement } from 'react';
import { createContext, useContext, useState } from 'react';
import type { User } from '../interface/User';

interface AuthContextType {
  user: User | null;
  login: () => Promise<User>;
  logout: () => Promise<void>;
}

interface AuthProviderType {
  children: ReactElement;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderType): ReactElement => {
  const [user, setUser] = useState<User | null>(null);

  const login = (): Promise<User> => {
    return new Promise((res, rej) => {
      setTimeout(() => {
        setUser({ id: 1 });
        res({ id: 1 });
      }, 2000);
    });
  };

  const logout = (): Promise<void> => {
    return new Promise((res, rej) => {
      setTimeout(() => {
        setUser(null);
        res();
      }, 2000);
    });
  };

  return <AuthContext value={{ user, login, logout }}>{children}</AuthContext>;
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
