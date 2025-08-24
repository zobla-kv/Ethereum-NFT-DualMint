import type { HardhatUserConfig } from 'hardhat/config';

import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  plugins: [hardhatToolboxViemPlugin],
};

export default config;
