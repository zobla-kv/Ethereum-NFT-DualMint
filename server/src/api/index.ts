import { Router } from 'express';
import aiRouter from './ai';

const router = Router();

router.use('/nft', aiRouter);

export default router;
