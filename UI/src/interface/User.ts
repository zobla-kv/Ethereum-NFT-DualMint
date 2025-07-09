export interface User {
  address: `0x${string}`;
  balance: WalletBalance | undefined;
}

interface WalletBalance {
  decimals: number;
  formatted: string;
  symbol: string;
  value: bigint;
}
