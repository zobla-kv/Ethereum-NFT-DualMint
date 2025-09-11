import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

import ApiError from '../../lib/ApiError';

import { generateNFTDraft } from '../../services/ai/ai';
import { uploadNFT } from '../../services/pinata/pinata';

import {
  validator,
  prompt,
  nftDraft,
} from '../../middleware/validators/validators';

const NFTRouter = Router();

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 5,
  message: {
    status: 429,
    message: 'Limited to 5 NFTs a day. Please try again in 24 hours',
  },
});

// prettier-ignore
NFTRouter.post('/', validator('[/nft][POST]', prompt), limiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nftDraft = await generateNFTDraft(req.body.prompt);
      res.status(200).json(nftDraft);
    } catch (err: unknown) {
      next(new ApiError(`[nft][POST]: ${err}`, { status: 500, message: 'Something went wrong. Please try again' }));
    }
  }
);

// prettier-ignore
NFTRouter.post('/pinata', validator('[/nft/pinata][POST]', nftDraft), limiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
      const metadataUri = await uploadNFT(req.body.nftDraft);
      res.status(200).json(metadataUri);
    } catch (err: unknown) {
      next(new ApiError(`[/nft/pinata][POST]: ${err}`, { status: 500, message: 'Something went wrong. Please try again' }));
    }
})

export default NFTRouter;
