import { z } from 'zod';
import { workflowRunStepStatusSchema } from './workflow-run-step-status-schema';

export const workflowRunStateStepInfoSchema = z.object({
  result: z.any().optional(),
  error: z.any().optional(),
  status: workflowRunStepStatusSchema,
  retryAttempt: z.number().optional(),
  // The conversation an agent step held on this execution, kept per history
  // entry so each loop iteration's conversation stays reachable.
  threadId: z.string().optional(),
  get history() {
    return z
      .array(
        workflowRunStateStepInfoSchema.pick({
          result: true,
          status: true,
          error: true,
          retryAttempt: true,
          threadId: true,
        }),
      )
      .optional();
  },
});
