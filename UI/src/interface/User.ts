export interface User {
  address: `0x${string}`;
  balance: {
    decimals: number;
    formatted: string;
    symbol: string;
    value: bigint;
  };
}
