import { type NFT } from './NFT';

export interface ApiErrorResponse {
  status: number;
  message: string;
}

export type NFTDraftResponse = NFT | ApiErrorResponse;
