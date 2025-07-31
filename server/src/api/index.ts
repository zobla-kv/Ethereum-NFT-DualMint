import { Router } from 'express';
import aiRouter from './ai';

const router = Router();

router.use('/images', aiRouter);

export default router;
