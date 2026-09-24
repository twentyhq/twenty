import { z } from 'zod';
import { workflowRunStepStatusSchema } from './workflow-run-step-status-schema';

export const workflowRunStateStepInfoSchema = z.object({
  result: z.any().optional(),
  error: z.any().optional(),
  status: workflowRunStepStatusSchema,
  retryAttempt: z.number().optional(),
  get history() {
    return z
      .array(
        workflowRunStateStepInfoSchema.pick({
          result: true,
          status: true,
          error: true,
          retryAttempt: true,
        }),
      )
      .optional();
  },
});
