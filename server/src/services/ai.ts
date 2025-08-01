import OpenAI from 'openai';

const openAI = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

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

  if (!response.data || !response.data[0].url) {
    throw new Error('OpenAI failed to generate the image');
  }

  return response.data[0].url;
}
