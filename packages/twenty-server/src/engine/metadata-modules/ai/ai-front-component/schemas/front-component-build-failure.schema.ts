import { z } from 'zod';

export const frontComponentBuildFailureSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.enum(['INVALID_INPUT', 'BUILD_FAILED']).optional(),
  userFriendlyMessage: z
    .object({
      id: z.string(),
      message: z.string().optional(),
      values: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
});
