import type { ReactElement } from 'react';
import toast from 'react-hot-toast';

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
      toast.error('You must connect a wallet first.');
      return;
    }

    if (chain.id === user.chainId) {
      navigate(`/chain/${chain.name}`);
      return;
    }

    switchChainAsync({ chainId: chain.id })
      .then((chain) => {
        navigate(`/chain/${chain.name}`);
      })
      .catch((err) => {
        toast.error('error connecting to: ' + chain.name);
      });
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center text-center pt-5 sm:pt-20">
        <div>
          <h1 className="text-3xl sm:text-4xl">
            Mint Your <span className="text-[var(--color-primary)]">NFT</span>{' '}
            with <span className="text-[var(--color-primary)]">AI</span>
          </h1>
          <p className="max-w-lg mb-12 text-[var(--color-text-accent)] text-sm sm:text-base">
            Choose your blockchain network and start minting unique NFTs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-10 sm:gap-20 mt-5">
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
