import { defineChain } from 'viem';
import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

const localhost = defineChain({
  id: 31337,
  name: 'Localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545/'] },
    public: { http: ['http://127.0.0.1:8545/'] },
  },
});

// TODO: disable localhost in production
const config = createConfig({
  chains: [localhost, sepolia],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Ethereum NFT Dualmint',
        url: 'http://localhost:5173',
        iconUrl: 'http://localhost:5173/src/assets/photo_icon.svg',
      },
      logging: { developerMode: true, sdk: true },
    }),
  ],
  transports: {
    [localhost.id]: http(),
    [sepolia.id]: http(),
  },
});

export default config;
