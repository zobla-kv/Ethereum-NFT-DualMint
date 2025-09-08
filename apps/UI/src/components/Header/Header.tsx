import type { FC } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: FC = () => {
  const { user, connect, disconnect } = useAuth();
  const navigate = useNavigate();

  return (
    <header>
      <span
        className="text-3xl text-[var(--color-primary)] font-bold cursor-pointer"
        onClick={() => navigate('/')}
      >
        Ethereum NFT DualMint
      </span>
      <div className="flex gap-4">
        {!user?.status || user.status !== 'connected' ? (
          <button onClick={connect} className="btn-primary">
            Metamask
          </button>
        ) : (
          <>
            <button onClick={() => navigate('/')} className="btn-primary">
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
