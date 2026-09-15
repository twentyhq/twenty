import { z } from 'zod';
import { workflowRunStateSchema } from './workflow-run-state-schema';
import { workflowRunStatusSchema } from './workflow-run-status-schema';
import { workflowRunStepLogsSchema } from './workflow-run-step-log-schema';

export const workflowRunSchema = z.looseObject({
  __typename: z.literal('WorkflowRun'),
  id: z.string(),
  workflowVersionId: z.string(),
  workflowId: z.string(),
  state: workflowRunStateSchema.nullable(),
  stepLogs: workflowRunStepLogsSchema.nullable().optional(),
  status: workflowRunStatusSchema,
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
  endedAt: z.string().nullable(),
  name: z.string(),
});
