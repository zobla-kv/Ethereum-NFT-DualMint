import 'dotenv/config';
import { createWalletClient, http, parseEther } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { privateKeyToAccount } from 'viem/accounts';
import { localhost } from 'viem/chains';

const funder = privateKeyToAccount(
  process.env.LOCAL_PRIVATE_KEY as `0x${string}`
);

const recipient = '0x4eE078C15c7926C174e32346f4210c9764eF7Cc6';

const client = createWalletClient({
  account: funder,
  chain: { ...localhost, id: 31337 },
  transport: http('http://127.0.0.1:8545'),
});

const txHash = await client.sendTransaction({
  to: recipient,
  value: parseEther('10'),
});

const receipt = await waitForTransactionReceipt(client, { hash: txHash });
console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
