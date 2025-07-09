import type { ReactElement } from 'react';

import MainLayout from '../layout/MainLayout';
import AuthLink from '../components/ui/AuthLink/AuthLink';

const HomePage = (): ReactElement => {
  return (
    <MainLayout>
      <>
        <h1>Home page</h1>
        <AuthLink to='/chain/sepolia' className='btn-primary'>
          Sepolia
        </AuthLink>
        <AuthLink to='/chain/mainnet' className='btn-primary'>
          Mainnet
        </AuthLink>
      </>
    </MainLayout>
  );
};

export default HomePage;
