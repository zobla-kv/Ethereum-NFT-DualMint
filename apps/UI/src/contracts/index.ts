import type { Abi } from 'viem';
import localhostAbi from './abi/localhost.json';
import sepoliaAbi from './abi/sepolia.json';

interface Contract {
  [key: number]: {
    address: `0x${string}`;
    abi: Abi | readonly unknown[];
    mintFn: string;
  };
}

export const contracts: Contract = {
  31337: {
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    abi: localhostAbi,
    mintFn: 'mint',
  },
  11155111: {
    address: '0x38797b839Cc526c518E1fB0500f2e34B7E19234B',
    abi: sepoliaAbi,
    mintFn: 'mintNft',
  },
};
