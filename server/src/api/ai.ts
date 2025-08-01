import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

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

aiRouter.post('/', limiter, (req: Request, res: Response) => {
  res.status(200).json({ response: 'image' });
});

export default aiRouter;
