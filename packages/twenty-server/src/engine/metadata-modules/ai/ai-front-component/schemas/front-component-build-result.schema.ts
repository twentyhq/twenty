import { z } from 'zod';

export const frontComponentBuildResultSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    compiledSource: z.string(),
    checksum: z.string().regex(/^[a-f0-9]{64}$/),
    sharedDependenciesChecksum: z.string().regex(/^[a-f0-9]{64}$/),
  }),
  z.object({ success: z.literal(false), error: z.string() }),
]);
