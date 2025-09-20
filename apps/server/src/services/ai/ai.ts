import OpenAI from 'openai';

import { NFT, NFTMetadata } from '@nft/types/NFT';

export const openAI = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

/**
 * Generate NFT draft image and metadata from prompt
 * @param prompt - prompt text
 * @returns image URL
 */
export async function generateNFTDraft(prompt: string): Promise<NFT> {
  const [imageUrl, metadata] = await Promise.all([
    generateImage(prompt),
    generateMetadataForPrompt(prompt),
  ]);

  return { metadata: { ...metadata, image: imageUrl } };
}

/**
 * Generate an image using OpenAI's DALL·E 3
 * @param prompt - prompt text
 * @returns image URL
 */
export async function generateImage(prompt: string): Promise<string> {
  const response = await openAI.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
  });

  const imageUrl = response.data?.[0]?.url;

  if (!imageUrl) {
    throw new Error('OpenAI failed to generate the image');
  }

  return imageUrl;
}

/**
 * Generate metadata for image using OpenAI's GPT-3.5, from prompt
 * @param prompt - prompt text
 * @returns image URL
 */
export async function generateMetadataForPrompt(
  prompt: string
): Promise<NFTMetadata> {
  const response = await openAI.chat.completions.create({
    model: 'gpt-3.5-turbo-1106',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a metadata generator for NFTs. Based on the prompt, return a valid JSON object that matches this TypeScript interface:

          interface NFTMetadata {
            name: string;
            description: string;
            attributes: {
              trait_type: string;
              value: string | number;
              display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date';
            }[];
          }

        ** IMPORTANT **
        - Do not include a period (".") at the end of any property value
        - Include 5 to 10 attributes
        - Make sure not to include any date in the response
        `,
      },
      {
        role: 'user',
        content: `Generate NFT metadata for this image prompt: "${prompt}". Use realistic, fantasy-style trait values.`,
      },
    ],
    temperature: 0.7,
  });

  const metadata = response.choices[0]?.message?.content?.trim();

  if (!metadata) {
    throw new Error('Failed to generate metadata for image.');
  }

  try {
    const parsed = JSON.parse(metadata) as NFTMetadata;

    const sanitize = (s: string) => s.replace(/\.$/, '');
    parsed.description = sanitize(parsed.description);

    return parsed;
  } catch (err) {
    throw new Error('Failed to parse metadata JSON from OpenAI');
  }
}
