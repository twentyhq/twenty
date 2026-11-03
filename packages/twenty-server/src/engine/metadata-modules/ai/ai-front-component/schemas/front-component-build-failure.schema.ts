import { z } from 'zod';

export const frontComponentBuildFailureSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z
    .enum([
      'INVALID_INPUT',
      'INVALID_SETTINGS',
      'BUILD_FAILED',
      'BUILD_TIMEOUT',
      'OUTPUT_TOO_LARGE',
    ])
    .optional(),
});
