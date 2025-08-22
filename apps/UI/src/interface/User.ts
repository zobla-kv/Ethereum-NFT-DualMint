import type { GetAccountReturnType } from '@wagmi/core';

export type User = GetAccountReturnType & {
  balance: WalletBalance | undefined;
};

interface WalletBalance {
  decimals: number;
  formatted: string;
  symbol: string;
  value: bigint;
}
