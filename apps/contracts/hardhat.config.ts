import type { HardhatUserConfig } from 'hardhat/config';

import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: '0.8.28',
  networks: {
    localhost: {
      chainId: 31337,
      type: 'http',
      url: 'http://127.0.0.1:8545/',
    },
  },
};

export default config;
