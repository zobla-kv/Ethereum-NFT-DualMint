import type { ReactElement } from 'react';
import Header from '../components/Header/Header';

interface Props {
  children: ReactElement;
}

const MainLayout = ({ children }: Props): ReactElement => {
  return (
    <div className="w-full">
      <Header />
      <main className="max-w-[1536px] mx-0 2xl:m-auto px-6 xl:px-12">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
