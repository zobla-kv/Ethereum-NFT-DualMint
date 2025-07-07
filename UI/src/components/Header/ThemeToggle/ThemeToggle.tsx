import { useState } from 'react';
import type { FC, ReactElement } from 'react';

const ThemeToggle: FC = (): ReactElement => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <button
      className='bg-blue-600 hover:bg-blue-400 text-white py-2 px-4 rounded'
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      Theme
    </button>
  );
};

export default ThemeToggle;
