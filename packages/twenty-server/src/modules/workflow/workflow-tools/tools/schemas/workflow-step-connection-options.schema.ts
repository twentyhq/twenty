import { WorkflowActionType } from 'twenty-shared/workflow';
import { z } from 'zod';

export const workflowStepConnectionOptionsSchema = z
  .discriminatedUnion('connectedStepType', [
    z
      .object({
        connectedStepType: z.literal(WorkflowActionType.ITERATOR),
        settings: z.object({
          isConnectedToLoop: z.boolean(),
        }),
      })
      .describe(
        'For an ITERATOR source. Set isConnectedToLoop to true for the edge that runs the loop body (the target then belongs to the loop rather than to the step after it).',
      ),
    z
      .object({
        connectedStepType: z.literal(WorkflowActionType.IF_ELSE),
        settings: z.object({
          branchId: z
            .string()
            .describe(
              'The id of one of the If/Else step branches (settings.input.branches[].id)',
            ),
        }),
      })
      .describe(
        'Required for an IF_ELSE source: a run only follows the steps of its branches, so the edge goes into the given branch.',
      ),
  ])
  .describe(
    'Connection options for an edge whose source is an ITERATOR or IF_ELSE step.',
  );
