import { useState } from 'react';
import type { FC, ReactElement } from 'react';

const ThemeToggle: FC = (): ReactElement => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <button
      className='btn-primary'
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      Theme
    </button>
  );
};

export default ThemeToggle;
