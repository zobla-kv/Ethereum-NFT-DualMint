import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

import { validatePrompt } from '../../middleware/validators/validators';
import { generateNFTDraft } from '../../services/ai/ai';
import ApiError from '../../lib/ApiError';

const NFTRouter = Router();

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 10,
  message: {
    status: 429,
    error: 'Too many requests',
    message:
      'You have reached the maximum number of images today. Please try again after 24 hours.',
  },
});

NFTRouter.post('/', limiter, validatePrompt('[nft][POST]'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nftDraft = await generateNFTDraft(req.body.prompt);
    res.status(200).json({ nftDraft });
    
  } catch (err: unknown) {
    next(new ApiError(`[nft][POST]: ${err}`, ApiError.errors.default));
  }
});

export default NFTRouter;
