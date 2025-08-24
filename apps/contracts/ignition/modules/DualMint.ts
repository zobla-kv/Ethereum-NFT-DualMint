import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('DualMintModule', (m) => {
  const dualMint = m.contract('DualMint');

  m.call(dualMint, 'mint');

  return { dualMint };
});
