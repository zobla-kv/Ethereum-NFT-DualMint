import type { ReactElement } from 'react';

import MainLayout from '../layout/MainLayout';
import AuthLink from '../components/ui/AuthLink/AuthLink';

import { useChains } from 'wagmi';

const HomePage = (): ReactElement => {
  const chains = useChains();

  return (
    <MainLayout>
      <>
        <h1>Home page</h1>
        {chains.map((chain) => (
          <AuthLink
            key={chain.id}
            to={`/chain/${chain.name}`}
            className='btn-primary'
          >
            {chain.name}
          </AuthLink>
        ))}
      </>
    </MainLayout>
  );
};

export default HomePage;
