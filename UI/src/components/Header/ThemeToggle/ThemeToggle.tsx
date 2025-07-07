import { useState } from 'react';
import type { FC, ReactElement } from 'react';
import Button from '../../Button.tsx/Button';

const ThemeToggle: FC = (): ReactElement => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <Button
      text='Theme'
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    ></Button>
  );
};

export default ThemeToggle;
