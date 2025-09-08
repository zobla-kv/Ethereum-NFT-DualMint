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
      <div className="flex flex-col items-center justify-center flex-grow text-center px-6">
        <div>
          <h1 className="text-4xl mb-4 mt-10">
            Mint Your <span className="text-[var(--color-primary)]">NFT</span>{' '}
            with <span className="text-[var(--color-primary)]">AI</span>
          </h1>
          <p className="max-w-xl mb-12 text-[var(--color-text-accent)]">
            Choose your blockchain network and start minting unique NFTs.
          </p>
        </div>

        <div className="flex gap-20 mt-5">
          {chains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => handleSwitchChain(chain)}
              className="chain-card"
            >
              {chain.name}
            </button>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
