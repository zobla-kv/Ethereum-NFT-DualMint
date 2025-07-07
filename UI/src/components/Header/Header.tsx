import type { FC } from 'react';

import ThemeToggle from './ThemeToggle/ThemeToggle';
import Button from '../Button.tsx/Button';

import { useAuth } from '../../context/AuthContext';

const Header: FC = () => {
  const { user, login } = useAuth();

  return (
    <div className='border flex justify-end py-2 px-4 gap-4'>
      <span>User: {user ? user.id : 'no user'}</span>
      <Button text='Login' onClick={login} />
      <ThemeToggle />
    </div>
  );
};

export default Header;
