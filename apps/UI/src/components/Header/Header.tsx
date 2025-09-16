import type { FC } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: FC = () => {
  const { user, connect, disconnect } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="py-8 px-6 xl:px-12 flex gap-5">
      <span
        className="text-3xl text-[var(--color-primary)] font-bold cursor-pointer"
        onClick={() => navigate('/')}
      >
        Ethereum NFT DualMint
      </span>
      <div className="flex flex-col sm:flex-row gap-4">
        {!user?.status || user.status !== 'connected' ? (
          <button onClick={connect} className="btn-primary">
            Metamask
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate('/')}
              className="btn-primary whitespace-nowrap"
            >
              Switch Chain
            </button>
            <button onClick={disconnect} className="btn-primary">
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
