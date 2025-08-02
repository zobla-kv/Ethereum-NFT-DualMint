import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

import { validatePrompt } from '../middleware/validators';
import { generateImage } from '../services/ai';
import ApiError from '../lib/ApiError';

const aiRouter = Router();

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

aiRouter.post('/', limiter, validatePrompt('[images][POST]'), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const imageUrl= await generateImage(req.body.prompt);
      res.status(200).json({ imageUrl});
      
    } catch (err: unknown) {
      next(new ApiError(`[images][POST]: ${err}`, ApiError.errors.default));
    }
  }
);

export default aiRouter;
