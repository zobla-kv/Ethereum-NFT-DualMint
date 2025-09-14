import { Request, Response, NextFunction } from 'express';
import ApiError from '../../lib/ApiError';
import { NFT } from '@nft/types/NFT';

interface ValidatorResult {
  valid: boolean;
  error?: string;
}

export const validator = (
  context: `[${string}][${string}]`,
  validatorFn: (body: unknown) => ValidatorResult
) => {
  return (req: Request, _: Response, next: NextFunction): void => {
    const { valid, error } = validatorFn(req.body);

    if (!valid) {
      next(
        new ApiError(`${context}: ${error ?? 'Invalid request body'}`, {
          status: 400,
          message: 'Invalid request body',
        })
      );
      return;
    }
    next();
  };
};

export const prompt = (body: unknown): ValidatorResult => {
  if (!body || typeof body !== 'object' || !('prompt' in body)) {
    return { valid: false };
  }

  const prompt = body.prompt as string;

  if (!prompt.trim()) {
    return { valid: false, error: "Prompt can't be empty" };
  }

  const regex = /^[a-zA-Z0-9 ,.\n]{1,200}$/;
  if (!regex.test(prompt)) {
    return {
      valid: false,
      error: 'Prompt can only contain letters, numbers, commas, and periods',
    };
  }
  return { valid: true };
};

export const nftDraft = (body: unknown): ValidatorResult => {
  if (!body || typeof body !== 'object' || !('nftDraft' in body)) {
    return { valid: false };
  }

  const nftDraft = body.nftDraft as NFT;

  if (
    !nftDraft ||
    !nftDraft.metadata ||
    typeof nftDraft.metadata.image !== 'string' ||
    typeof nftDraft.metadata.name !== 'string'
  ) {
    return { valid: false, error: "Invalid 'nftDraft'" };
  }

  return { valid: true };
};
