import { useChainId } from 'wagmi';
import { contracts } from '../contracts/index';

export const useContract = () => {
  const chainId = useChainId();
  const contract = contracts[chainId];

  if (!contract) {
    throw new Error(`No contract for chainId: ${chainId}`);
  }

  return contract;
};
