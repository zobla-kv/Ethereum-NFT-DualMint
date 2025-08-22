import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

import { validatePrompt } from '../../middleware/validators/validators';
import { generateNFTDraft } from '../../services/ai/ai';
import ApiError from '../../lib/ApiError';

const NFTRouter = Router();

// TODO: [ApiError] expand ApiError to include a message and error
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 5,
  message: {
    status: 429,
    error: 'Too many requests',
    message:
      'You have reached the maximum number of NFTs today. Please try again after 24 hours.',
  },
});

NFTRouter.post('/', validatePrompt('[nft][POST]'), limiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nftDraft = await generateNFTDraft(req.body.prompt);
      res.status(200).json(nftDraft);
    } catch (err: unknown) {
      next(new ApiError(`[nft][POST]: ${err}`, ApiError.errors.default));
    }
  }
);

export default NFTRouter;
