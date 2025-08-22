import { type NFT } from './NFT';

export interface ApiError {
  status: number;
  error: string;
  message?: string; // TODO: [ApiError] remove questionmark
}

export interface NFTDraftSucessResponse {
  nftDraft: NFT;
}

export type NFTDraftResponse = NFTDraftSucessResponse | ApiError;
