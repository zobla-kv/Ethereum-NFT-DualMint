import type { ReactElement } from 'react';
import Header from '../components/Header/Header';

interface Props {
  children: ReactElement;
}

const MainLayout = ({ children }: Props): ReactElement => {
  return (
    <div className="w-full">
      <Header />
      <main>{children}</main>
    </div>
  );
};

export default MainLayout;
