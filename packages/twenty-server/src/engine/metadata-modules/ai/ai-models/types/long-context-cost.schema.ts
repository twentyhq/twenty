import { z } from 'zod';

export const longContextCostSchema = z.object({
  inputCostPerMillionTokens: z.number(),
  outputCostPerMillionTokens: z.number(),
  cachedInputCostPerMillionTokens: z.number().optional(),
  cacheCreationCostPerMillionTokens: z.number().optional(),
  thresholdTokens: z.number(),
});
