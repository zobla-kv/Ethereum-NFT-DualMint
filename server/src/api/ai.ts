import { Router, Request, Response } from 'express';

const aiRouter = Router();

aiRouter.post('/', (req: Request, res: Response) => {
  res.status(200).json({ response: 'image' });
});

export default aiRouter;
