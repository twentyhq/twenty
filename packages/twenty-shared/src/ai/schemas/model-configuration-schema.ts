import { z } from 'zod';

const nativeToolConfigurationSchema = z.object({
  enabled: z.boolean(),
  // not z.unknown(): TypeORM cannot type a partial update of a workflow step holding unknown values
  configuration: z.record(z.string(), z.any()).optional(),
});

export const modelConfigurationSchema = z.object({
  webSearch: nativeToolConfigurationSchema.optional(),
  twitterSearch: nativeToolConfigurationSchema.optional(),
});
