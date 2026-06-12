import { z } from 'zod';

export const baseWorkflowActionSchema = z.object({
  id: z
    .uuid()
    .describe(
      'Unique UUID identifier for the workflow step. Must be a valid UUID v4, unique within the workflow.',
    ),
  name: z
    .string()
    .describe(
      'Human-readable name for the workflow step. Should clearly describe what the step does.',
    ),
  valid: z
    .boolean()
    .describe(
      'Whether the step configuration is valid. Set to true when all required fields are properly configured.',
    ),
  nextStepIds: z
    .array(z.uuid())
    .optional()
    .nullable()
    .describe(
      'Array of step IDs that this step connects to. Leave empty or null for the final step.',
    ),
  position: z
    .object({ x: z.number(), y: z.number() })
    .optional()
    .nullable()
    .describe('Position coordinates for the step in the workflow diagram.'),
});
