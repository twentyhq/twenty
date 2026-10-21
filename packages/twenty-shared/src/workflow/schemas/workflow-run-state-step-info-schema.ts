import { z } from 'zod';
import { workflowRunStepStatusSchema } from './workflow-run-step-status-schema';
import { workflowStepWaitSchema } from './workflow-step-wait-schema';

export const workflowRunStateStepInfoSchema = z.object({
  result: z.any().optional(),
  error: z.any().optional(),
  status: workflowRunStepStatusSchema,
  retryAttempt: z.number().optional(),
  // Legacy: the agent step's conversation, written by runs before it moved to the step log
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
