import type { FC } from 'react';

import ThemeToggle from './ThemeToggle/ThemeToggle';

import { useAuth } from '../../context/AuthContext';

const Header: FC = () => {
  const { user, connect, disconnect } = useAuth();

  return (
    <div className='border flex justify-between items-center py-2 px-4'>
      <div>
        <p>address: {user?.address}</p>
        <p>balance: {user?.balance?.value}</p>
      </div>
      <div className='flex gap-4 items-center'>
        <button className='btn-primary' onClick={connect}>MetaMask</button>
        <button className='btn-primary' onClick={disconnect}>Logout</button>
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Header;
