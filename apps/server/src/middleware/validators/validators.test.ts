import { validator, prompt, nftDraft } from './validators';
import ApiError from '../../lib/ApiError';
import { Request, Response, NextFunction } from 'express';
import { NFT } from '@nft/types/NFT';

describe('Validators', () => {
  describe('prompt validator', () => {
    it('returns valid true for correct prompt', () => {
      const result = prompt({ prompt: 'Hello, world.' });
      expect(result).toEqual({ valid: true });
    });

    it('returns invalid for missing prompt', () => {
      const result = prompt({});
      expect(result).toEqual({ valid: false });
    });

    it('returns invalid for disallowed characters', () => {
      const result = prompt({ prompt: 'Invalid@prompt!' });
      expect(result).toEqual({
        valid: false,
        error: 'Prompt can only contain letters, numbers, commas, and periods',
      });
    });

    it('returns invalid for empty input', () => {
      const result = prompt(null);
      expect(result).toEqual({ valid: false });
    });
  });

  describe('nftDraft validator', () => {
    const validNFT: NFT = {
      metadata: {
        name: 'NFT Name',
        description: 'NFT Description',
        image: 'http://example.com/image.png',
        attributes: [],
      },
    };

    it('returns valid true for correct nftDraft', () => {
      expect(nftDraft({ nftDraft: validNFT })).toEqual({ valid: true });
    });

    it('returns invalid if nftDraft missing', () => {
      expect(nftDraft({})).toEqual({ valid: false });
    });

    it('returns invalid if nftDraft.metadata.name or image missing', () => {
      expect(
        nftDraft({ nftDraft: { metadata: { name: '', image: 123 } } })
      ).toEqual({ valid: false, error: "Invalid 'nftDraft'" });
    });

    it('returns invalid if nftDraft is null', () => {
      expect(nftDraft({ nftDraft: null })).toEqual({
        valid: false,
        error: "Invalid 'nftDraft'",
      });
    });
  });

  describe('validator middleware', () => {
    const next: NextFunction = jest.fn();

    it('calls next without error for valid input', () => {
      const req = { body: { prompt: 'Hello, world.' } } as Request;
      const mw = validator('[Test][Prompt]', prompt);

      mw(req, {} as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('calls next with ApiError for invalid input', () => {
      const req = { body: { prompt: 'Invalid@prompt!' } } as Request;
      const mw = validator('[Test][Prompt]', prompt);

      const next = jest.fn() as jest.MockedFunction<NextFunction>;

      mw(req, {} as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = (next as jest.Mock).mock.calls[0][0] as ApiError;

      expect(error.response.status).toBe(400);
      expect(error.message).toContain('[Test][Prompt]');
    });
  });
});
