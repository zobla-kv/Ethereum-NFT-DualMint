import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

import { validatePrompt } from '../../middleware/validators/validators';
import { generateNFTDraft } from '../../services/ai/ai';
import ApiError from '../../lib/ApiError';

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
NFTRouter.post('/', validatePrompt('[nft][POST]'), limiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nftDraft = await generateNFTDraft(req.body.prompt);
      res.status(200).json(nftDraft);
    } catch (err: unknown) {
      next(new ApiError(`[nft][POST]: ${err}`, { status: 500, message: 'Something went wrong. Please try again' }));
    }
  }
);

export default NFTRouter;
