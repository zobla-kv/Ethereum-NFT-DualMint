import type { HardhatUserConfig } from 'hardhat/config';
import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';
import 'dotenv/config';

const {
  ENV,
  LOCALHOST_RPC_URL,
  LOCALHOST_DEPLOYER_PRIVATE_KEY,
  SEPOLIA_RPC_URL,
  SEPOLIA_DEPLOYER_PRIVATE_KEY,
  MAINNET_RPC_URL,
  MAINNET_DEPLOYER_PRIVATE_KEY,
} = process.env;

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    compilers: [
      {
        version: '0.8.28',
        settings: {
          optimizer: { enabled: ENV === 'mainnet', runs: 200 },
        },
      },
    ],
  },
  networks: {
    localhost: {
      chainId: 31337,
      type: 'http',
      url: LOCALHOST_RPC_URL || '',
      accounts: LOCALHOST_DEPLOYER_PRIVATE_KEY
        ? [LOCALHOST_DEPLOYER_PRIVATE_KEY]
        : [],
    },
    sepolia: {
      chainId: 11155111,
      type: 'http',
      url: SEPOLIA_RPC_URL || '',
      accounts: SEPOLIA_DEPLOYER_PRIVATE_KEY
        ? [SEPOLIA_DEPLOYER_PRIVATE_KEY]
        : [],
    },
    mainnet: {
      chainId: 1,
      type: 'http',
      url: MAINNET_RPC_URL || '',
      accounts: MAINNET_DEPLOYER_PRIVATE_KEY
        ? [MAINNET_DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },
};

export default config;
