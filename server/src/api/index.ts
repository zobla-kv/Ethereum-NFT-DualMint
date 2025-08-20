import { Router } from 'express';
import NFTRouter from './nft/nft';

const router = Router();

router.use('/nft', NFTRouter);

export default router;
