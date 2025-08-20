import {
  generateNFTDraft,
  generateImage,
  generateMetadataForPrompt,
} from '../../services/ai/ai';
import { openAI } from '../../services/ai/ai';
import { NFT } from '../../lib/NFT';

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    images: {
      generate: jest.fn(),
    },
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

describe('ai service', () => {
  describe('generateImage', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('returns image url when OpenAI responds', async () => {
      (openAI.images.generate as jest.Mock).mockResolvedValueOnce({
        data: [{ url: 'http://image-url' }],
      });

      const url = await generateImage('cat');
      expect(url).toBe('http://image-url');
    });

    it('throws error if OpenAI does not return url', async () => {
      (openAI.images.generate as jest.Mock).mockResolvedValue({
        data: [{}],
      });
      await expect(generateImage('cat')).rejects.toThrow(
        'OpenAI failed to generate the image'
      );
    });
  });

  describe('generateMetadataForPrompt', () => {
    it('returns parsed metadata when OpenAI responds with valid JSON', async () => {
      const metadata = {
        name: 'NFT Cat',
        description: 'A cool cat',
        attributes: [{ trait_type: 'Color', value: 'Black' }],
      };
      (openAI.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(metadata) } }],
      });
      const result = await generateMetadataForPrompt('cat');
      expect(result).toEqual(metadata);
    });

    it('throws error if OpenAI returns empty content', async () => {
      (openAI.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: '' } }],
      });
      await expect(generateMetadataForPrompt('cat')).rejects.toThrow(
        'Failed to generate metadata for image.'
      );
    });

    it('throws error if OpenAI returns invalid JSON', async () => {
      (openAI.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: 'not-json' } }],
      });
      await expect(generateMetadataForPrompt('cat')).rejects.toThrow(
        'Failed to parse metadata JSON from OpenAI'
      );
    });
  });

  describe('generateNFTDraft', () => {
    it('returns NFT object with metadata and image', async () => {
      (openAI.images.generate as jest.Mock).mockResolvedValueOnce({
        data: [{ url: 'http://image-url' }],
      });

      const metadata = {
        name: 'NFT Cat',
        description: 'A cool cat',
        attributes: [{ trait_type: 'Color', value: 'Black' }],
      };

      (openAI.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(metadata) } }],
      });

      const result = await generateNFTDraft('cat');
      expect(result).toMatchObject<NFT>({
        metadata: {
          ...metadata,
          image: 'http://image-url',
        },
      });
    });
  });
});
