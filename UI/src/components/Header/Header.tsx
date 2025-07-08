import type { FC } from 'react';

import ThemeToggle from './ThemeToggle/ThemeToggle';
import Button from '../ui/Button/Button';

import { useAuth } from '../../context/AuthContext';

const Header: FC = () => {
  const { user, login, logout } = useAuth();

  return (
    <div className='border flex justify-between items-center py-2 px-4'>
      <div>
        <p>address: {user?.address}</p>
        <p>balance: {user?.balance.value}</p>
      </div>
      <div className='flex gap-4 items-center'>
        <Button text='MetaMask' onClick={login} />
        <Button text='Logout' onClick={logout} />
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Header;
