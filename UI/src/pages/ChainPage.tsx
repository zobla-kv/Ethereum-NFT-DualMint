import type { ReactElement } from 'react';

import MainLayout from '../layout/MainLayout';

import { useParams } from 'react-router-dom';

const ChainPage = (): ReactElement => {
  const { network } = useParams<{ network: string }>();

  return (
    <MainLayout>
      {/* TODO: add NFT mint button */}
      <h1>Chain: {network}</h1>
    </MainLayout>
  );
};

export default ChainPage;
