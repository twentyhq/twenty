import { z } from 'zod';

import { frontComponentBuildFailureSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-failure.schema';

export const frontComponentBuildResultSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    builtCode: z.string(),
    usesSdkClient: z.boolean(),
    checksum: z.string().regex(/^[a-f0-9]{64}$/),
    sharedDependenciesChecksum: z.string().regex(/^[a-f0-9]{64}$/),
  }),
  frontComponentBuildFailureSchema,
]);
