import { z } from 'zod';
import { workflowRunStepStatusSchema } from './workflow-run-step-status-schema';
import { workflowStepWaitSchema } from './workflow-step-wait-schema';

export const workflowRunStateStepInfoSchema = z.object({
  result: z.any().optional(),
  error: z.any().optional(),
  status: workflowRunStepStatusSchema,
  retryAttempt: z.number().optional(),
  // The agent step's conversation, kept per history entry so each loop iteration's one stays reachable.
  threadId: z.string().optional(),
  // What a PENDING step waits on
  wait: workflowStepWaitSchema.optional(),
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
