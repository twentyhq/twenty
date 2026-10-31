import { z } from 'zod';

const nativeToolConfigurationSchema = z.object({
  enabled: z.boolean(),
  configuration: z.record(z.string(), z.any()).optional(),
});

export const modelConfigurationSchema = z.object({
  webSearch: nativeToolConfigurationSchema.optional(),
  twitterSearch: nativeToolConfigurationSchema.optional(),
});
