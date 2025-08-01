import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

import { generateImage } from '../services/ai';
import ApiError from '../lib/ApiError';

const aiRouter = Router();

// rate limiter
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

aiRouter.post('/', limiter, async (req: Request, res: Response, next: NextFunction) => {
    const { prompt } = req.body;

    try {
      const image_url = await generateImage(prompt);
      res.status(200).json({ image_url });
      
    } catch (err: unknown) {
      next(new ApiError(`[images][POST]: ${err}`));
    }
  }
);

export default aiRouter;
