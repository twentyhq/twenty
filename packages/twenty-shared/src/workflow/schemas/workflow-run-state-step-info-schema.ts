import { z } from 'zod';
import { workflowRunStepStatusSchema } from './workflow-run-step-status-schema';

export const workflowRunStateStepInfoSchema = z.object({
  result: z.any().optional(),
  error: z.any().optional(),
  status: workflowRunStepStatusSchema,
});
