import { type NFT } from './NFT';

export interface ApiErrorResponse {
  status: number;
  error: string;
  message?: string; // TODO: [ApiError] remove questionmark
}

export type NFTDraftResponse = NFT | ApiErrorResponse;
