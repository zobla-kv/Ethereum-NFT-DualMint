import https from 'https';
import pinataSDK from '@pinata/sdk';
import { Readable } from 'stream';

import { NFT } from '@nft/types/NFT';

const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET,
});

/**
 * Uploads NFT image and metadata to Pinata
 * @param nft - NFT
 * @returns metadata CID
 */
export async function uploadNFT(nft: NFT): Promise<string> {
  const { name, image: imgUrl } = nft.metadata;

  let imageStream: Readable;

  // download image from url
  try {
    imageStream = await new Promise<Readable>((resolve, reject) => {
      const request = https.get(imgUrl, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Https ${res.statusCode}`));
          return;
        }

        res.on('error', (err) =>
          reject(new Error(`Image stream error: ${err.message}`))
        );

        resolve(res);
      });

      request.on('error', (err) =>
        reject(new Error(`Https request error: ${err.message}`))
      );

      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Image download timed out'));
      });
    });
  } catch (err: any) {
    throw new Error(`Pinata: Image download failed: ${err.message}`);
  }

  // upload image to Pinata
  let imageResult;
  try {
    imageResult = await pinata.pinFileToIPFS(imageStream, {
      pinataMetadata: { name: `${name}.png` },
    });

    if (!imageResult || !imageResult.IpfsHash) {
      throw new Error('Pinata returned invalid image result');
    }
  } catch (err: any) {
    throw new Error(`Pinata: Image upload failed: ${err.message}`);
  }

  const imageCID = `ipfs://${imageResult.IpfsHash}`;

  // upload metadata to Pinata
  const metadata = { ...nft.metadata, image: imageCID };
  let metadataResult;
  try {
    metadataResult = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: { name: `${name}.json` },
    });

    if (!metadataResult || !metadataResult.IpfsHash) {
      throw new Error('Pinata returned invalid metadata result');
    }
  } catch (err: any) {
    throw new Error(`Pinata: Metadata upload failed: ${err.message}`);
  }

  return metadataResult.IpfsHash;
}
