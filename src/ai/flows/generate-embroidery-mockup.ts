'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating realistic embroidery mockups.
 *
 * - generateEmbroideryMockup - A function that generates a visual mockup of a logo embroidered on a product.
 * - GenerateEmbroideryMockupInput - The input type for the generateEmbroideryMockup function.
 * - GenerateEmbroideryMockupOutput - The return type for the generateEmbroideryMockup function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEmbroideryMockupInputSchema = z.object({
  logoDataUri: z
    .string()
    .describe(
      "A logo image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productType: z
    .string()
    .describe('The type of product (e.g., "t-shirt", "cap", "bag")'),
  embroideryPosition: z
    .string()
    .describe('The position on the product for the embroidery (e.g., "chest", "sleeve", "back")'),
});
export type GenerateEmbroideryMockupInput = z.infer<typeof GenerateEmbroideryMockupInputSchema>;

const GenerateEmbroideryMockupOutputSchema = z.object({
  mockupDataUri: z
    .string()
    .describe(
      "A data URI of the generated visual mockup, including the embroidered logo on the product. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateEmbroideryMockupOutput = z.infer<typeof GenerateEmbroideryMockupOutputSchema>;

export async function generateEmbroideryMockup(
  input: GenerateEmbroideryMockupInput
): Promise<GenerateEmbroideryMockupOutput> {
  return generateEmbroideryMockupFlow(input);
}

const generateMockupPrompt = ai.definePrompt({
  name: 'generateEmbroideryMockupPrompt',
  input: { schema: GenerateEmbroideryMockupInputSchema },
  output: { schema: GenerateEmbroideryMockupOutputSchema },
  prompt: `Generate a photorealistic, high-quality embroidery mockup.\n\nProduct Type: {{{productType}}}\nEmbroidery Position: {{{embroideryPosition}}}\n\nThe embroidery should appear realistic, with appropriate texture, stitching, lighting, and perspective as if it were truly embroidered on the {{productType}}.\nThe logo to be embroidered is provided below.\n\n{{media url=logoDataUri}}`,
});

const generateEmbroideryMockupFlow = ai.defineFlow(
  {
    name: 'generateEmbroideryMockupFlow',
    inputSchema: GenerateEmbroideryMockupInputSchema,
    outputSchema: GenerateEmbroideryMockupOutputSchema,
  },
  async (input) => {
    const { media } = await generateMockupPrompt(input, {
      model: 'googleai/gemini-2.5-flash-image',
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Must include TEXT and IMAGE for image generation models
      },
    });

    if (!media || media.length === 0 || !media[0].url) {
      throw new Error('Failed to generate mockup image.');
    }

    return {
      mockupDataUri: media[0].url,
    };
  }
);
