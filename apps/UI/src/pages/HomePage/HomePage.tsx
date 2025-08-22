import type { ReactElement } from 'react';

import MainLayout from '../../layout/MainLayout';

import { useAuth } from '../../context/AuthContext';
import { useSwitchChain } from 'wagmi';
import { useNavigate } from 'react-router';
import type { Chain } from 'viem';

const HomePage = (): ReactElement => {
  const { user } = useAuth();
  const { chains, switchChainAsync } = useSwitchChain();
  const navigate = useNavigate();

  const handleSwitchChain = (chain: Chain) => {
    if (user?.status !== 'connected') {
      // TODO: add toast
      alert('You must connect a wallet first.');
      return;
    }

    if (chain.id === user.chainId) {
      navigate(`/chain/${chain.name}`);
      return;
    }

    switchChainAsync({ chainId: chain.id })
      .then((chain) => {
        // TODO: add toast
        navigate(`/chain/${chain.name}`);
      })
      .catch((err) => {
        // TODO: add toast
        alert('error connecting to: ' + chain.name);
      });
  };

  return (
    <MainLayout>
      <>
        <h1>Home page</h1>
        {chains.map((chain) => (
          <button key={chain.id} onClick={() => handleSwitchChain(chain)}>
            {chain.name}
          </button>
        ))}
      </>
    </MainLayout>
  );
};

export default HomePage;
