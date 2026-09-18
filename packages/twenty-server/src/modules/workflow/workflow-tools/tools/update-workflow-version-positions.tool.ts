import { z } from 'zod';

import { type WorkflowStepPositionUpdateInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-update.input';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const updateWorkflowVersionPositionsSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID'),
  positions: z
    .array(
      z.object({
        id: z.string().describe('Step or trigger ID'),
        position: z.object({
          x: z.number(),
          y: z.number(),
        }),
      }),
    )
    .describe('Array of step positions to update'),
});

export const createUpdateWorkflowVersionPositionsTool = (
  deps: Pick<WorkflowToolDependencies, 'coreWorkflowVersionMutationService'>,
  context: WorkflowToolContext,
) => ({
  name: 'update_workflow_version_positions' as const,
  description:
    'Update the positions of multiple workflow steps. This is useful for reorganizing the workflow layout.',
  inputSchema: updateWorkflowVersionPositionsSchema,
  execute: async (parameters: {
    coreWorkflowVersionId: string;
    positions: WorkflowStepPositionUpdateInput[];
  }) => {
    try {
      return await deps.coreWorkflowVersionMutationService.updatePositions({
        coreWorkflowVersionId: parameters.coreWorkflowVersionId,
        positions: parameters.positions,
        workspaceId: context.workspaceId,
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to update workflow version step positions: ${error.message}`,
      };
    }
  },
});
