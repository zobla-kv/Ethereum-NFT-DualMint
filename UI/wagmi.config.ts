import { http, createConfig } from 'wagmi';
import { sepolia, goerli } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

const config = createConfig({
  chains: [sepolia, goerli],
  connectors: [metaMask()],
  transports: {
    [sepolia.id]: http(),
    [goerli.id]: http(),
  },
});

export default config;
