import request from 'supertest';
import express from 'express';

import NFTRouter from './nft';
import errorHandler from '../../middleware/errorHandler/errorHandler';
import { generateNFTDraft } from '../../services/ai/ai';

jest.mock('express-rate-limit', () => {
  return jest.fn(() => (req: any, res: any, next: any) => next());
});

const app = express();
app.use(express.json());
app.use('/api/v1/nfts', NFTRouter);
app.use(errorHandler);

jest.mock('../../services/ai/ai', () => ({
  generateNFTDraft: jest.fn(),
}));

describe('API /v1/nfts', () => {
  describe('POST /metadata', () => {
    it('should use validatePrompt middleware and return 400 for invalid prompt', async () => {
      const res = await request(app)
        .post('/api/v1/nfts/metadata')
        .send({ prompt: '!!!' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Invalid request body');
    });

    it('should return 500 if generateNFTDraft throws an error', async () => {
      (generateNFTDraft as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const res = await request(app)
        .post('/api/v1/nfts/metadata')
        .send({ prompt: 'ValidPrompt' });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toContain('Something went wrong');
    });

    it('should return valid model on success', async () => {
      (generateNFTDraft as jest.Mock).mockResolvedValueOnce({
        metadata: {
          image: 'mock-url',
          name: 'mock',
          description: 'mock',
          attributes: [],
        },
      });
      const res = await request(app)
        .post('/api/v1/nfts/metadata')
        .send({ prompt: 'ValidPrompt' });
      expect(res.statusCode).toBe(200);
      expect(res.body.metadata).toBeDefined();
      expect(res.body.metadata.image).toBe('mock-url');
    });
  });
});
