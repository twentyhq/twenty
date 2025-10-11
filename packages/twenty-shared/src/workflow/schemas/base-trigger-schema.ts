import { z } from 'zod';

export const baseTriggerSchema = z.object({
  name: z
    .string()
    .optional()
    .describe(
      'Human-readable name for the trigger. Optional but recommended for clarity.',
    ),
  type: z
    .enum(['DATABASE_EVENT', 'MANUAL', 'CRON', 'WEBHOOK'])
    .describe(
      'Type of trigger. DATABASE_EVENT for record changes, MANUAL for user-initiated, CRON for scheduled, WEBHOOK for external calls.',
    ),
  position: z
    .object({ x: z.number(), y: z.number() })
    .optional()
    .nullable()
    .describe(
      'Position coordinates for the trigger in the workflow diagram. Use (0, 0) for the trigger step.',
    ),
  nextStepIds: z
    .array(z.string())
    .optional()
    .nullable()
    .describe(
      'Array of step IDs that the trigger connects to. These are the first steps in the workflow.',
    ),
});
