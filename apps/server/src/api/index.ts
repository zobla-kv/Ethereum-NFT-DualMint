import { Router } from 'express';
import NFTRouter from './nft/nft';

const router = Router();

router.use('/v1/nfts', NFTRouter);

export default router;
