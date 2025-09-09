import https from 'https';
import { Readable } from 'stream';
import pinataSDK from '@pinata/sdk';
import { uploadNFT } from './pinata';
import { NFT } from '@nft/types/NFT';

jest.mock('https', () => ({
  get: jest.fn(),
}));

jest.mock('@pinata/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    pinFileToIPFS: jest.fn(),
    pinJSONToIPFS: jest.fn(),
  }));
});

describe('uploadNFT', () => {
  const nft: NFT = {
    metadata: {
      name: 'TestNFT',
      description: 'A test NFT',
      image: 'https://example.com/image.png',
      attributes: [{ trait_type: 'Color', value: 'Blue' }],
    },
  };
  let mockStream: Readable;
  const pinataInstance =
    (pinataSDK as jest.Mock).mock.results[0]?.value || new pinataSDK();

  beforeEach(() => {
    jest.clearAllMocks();

    mockStream = new Readable();
    mockStream._read = () => {};
  });

  it('throws error if image download returns non-200 status', async () => {
    (https.get as jest.Mock).mockImplementation((url, callback) => {
      process.nextTick(() => callback(mockStream));
      return { on: jest.fn(), setTimeout: jest.fn(), destroy: jest.fn() };
    });

    (mockStream as any).statusCode = 404;

    await expect(uploadNFT(nft)).rejects.toThrow(
      'Pinata: Image download failed: Https 404'
    );
  });

  it('uploads image and metadata successfully', async () => {
    (https.get as jest.Mock).mockImplementation((url, callback) => {
      process.nextTick(() => callback(mockStream));
      return {
        on: jest.fn(),
        setTimeout: jest.fn((ms, cb) => {}),
        destroy: jest.fn(),
      };
    });

    (mockStream as any).statusCode = 200;

    pinataInstance.pinFileToIPFS.mockResolvedValue({ IpfsHash: 'imageHash' });
    pinataInstance.pinJSONToIPFS.mockResolvedValue({
      IpfsHash: 'metadataHash',
    });

    await uploadNFT(nft);
    expect(pinataInstance.pinFileToIPFS).toHaveBeenCalledWith(
      mockStream,
      expect.objectContaining({
        pinataMetadata: { name: 'TestNFT.png' },
      })
    );

    expect(pinataInstance.pinJSONToIPFS).toHaveBeenCalledWith(
      expect.objectContaining({
        ...nft.metadata,
        image: expect.stringContaining('imageHash'),
      }),
      expect.objectContaining({
        pinataMetadata: { name: 'TestNFT.json' },
      })
    );
  });

  it('throws error if image download fails', async () => {
    (https.get as jest.Mock).mockImplementation((url, callback) => {
      process.nextTick(() => {});
      return {
        on: (event: string, cb: Function) => {
          if (event === 'error') cb(new Error('Https 500'));
        },
        setTimeout: jest.fn((ms, cb) => {}),
        destroy: jest.fn(),
      };
    });

    await expect(uploadNFT(nft)).rejects.toThrow(
      'Pinata: Image download failed: Https request error: Https 500'
    );
  });

  it('throws error if image upload to Pinata fails', async () => {
    (https.get as jest.Mock).mockImplementation((url, callback) => {
      process.nextTick(() => callback(mockStream));
      return { on: jest.fn(), setTimeout: jest.fn(), destroy: jest.fn() };
    });

    (mockStream as any).statusCode = 200;

    pinataInstance.pinFileToIPFS.mockRejectedValue(
      new Error('Pinata image error')
    );

    await expect(uploadNFT(nft)).rejects.toThrow(
      'Pinata: Image upload failed: Pinata image error'
    );
  });

  it('throws error if metadata upload to Pinata fails', async () => {
    (https.get as jest.Mock).mockImplementation((url, callback) => {
      process.nextTick(() => callback(mockStream));
      return { on: jest.fn(), setTimeout: jest.fn(), destroy: jest.fn() };
    });

    (mockStream as any).statusCode = 200;

    pinataInstance.pinFileToIPFS.mockResolvedValue({ IpfsHash: 'imageHash' });
    pinataInstance.pinJSONToIPFS.mockRejectedValue(
      new Error('Pinata metadata error')
    );

    await expect(uploadNFT(nft)).rejects.toThrow(
      'Pinata: Metadata upload failed: Pinata metadata error'
    );
  });
});
