import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('DualMintNFTModule', (m) => {
  const dualMintNFT = m.contract('DualMintNFT');
  return { dualMintNFT };
});
