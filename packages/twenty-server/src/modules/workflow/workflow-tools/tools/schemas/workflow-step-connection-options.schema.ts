import { WorkflowActionType } from 'twenty-shared/workflow';
import { z } from 'zod';

export const workflowStepConnectionOptionsSchema = z
  .object({
    connectedStepType: z.literal(WorkflowActionType.ITERATOR),
    settings: z.object({
      isConnectedToLoop: z.boolean(),
    }),
  })
  .describe(
    'Connection options identifying an edge whose source is an ITERATOR step. Set isConnectedToLoop to true for the edge that runs the loop body (the target then belongs to the loop rather than to the step after it).',
  );
