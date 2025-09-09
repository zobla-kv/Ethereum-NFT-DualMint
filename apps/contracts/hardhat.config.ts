import type { HardhatUserConfig } from 'hardhat/config';

import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';
import { configVariable } from 'hardhat/config';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: '0.8.28',
  networks: {
    localhost: {
      chainId: 31337,
      type: 'http',
      url: 'http://127.0.0.1:8545/',
      accounts: [configVariable('LOCAL_PRIVATE_KEY')],
    },
  },
};

export default config;
