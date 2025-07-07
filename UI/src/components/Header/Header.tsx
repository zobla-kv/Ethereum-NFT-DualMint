import type { FC } from 'react';
import ThemeToggle from './ThemeToggle/ThemeToggle';

const Header: FC = () => {
  return (
    <div className='border flex justify-end py-2 px-4'>
      <ThemeToggle />
    </div>
  );
};

export default Header;
