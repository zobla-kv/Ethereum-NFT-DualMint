import { http, createConfig } from 'wagmi';
import { sepolia, arbitrum } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

const config = createConfig({
  chains: [sepolia, arbitrum],
  connectors: [metaMask()],
  transports: {
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
  },
});

export default config;
