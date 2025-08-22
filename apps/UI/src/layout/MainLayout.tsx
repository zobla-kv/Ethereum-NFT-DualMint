import type { ReactElement } from 'react';
import Header from '../components/Header/Header';

interface Props {
  children: ReactElement;
}

const MainLayout = ({ children }: Props): ReactElement => {
  return (
    <div className='border w-full'>
      <Header />
      <main className='min-h-screen max-w-[1440px] border mx-auto mt-5'>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
