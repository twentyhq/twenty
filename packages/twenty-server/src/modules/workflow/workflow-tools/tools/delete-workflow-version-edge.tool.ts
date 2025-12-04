import { z } from 'zod';

import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

export const deleteWorkflowVersionEdgeSchema = z.object({
  workflowVersionId: z.string().describe('The ID of the workflow version'),
  source: z.string().describe('The ID of the source step'),
  target: z.string().describe('The ID of the target step'),
});

export type DeleteWorkflowVersionEdgeInput = z.infer<
  typeof deleteWorkflowVersionEdgeSchema
>;

export const createDeleteWorkflowVersionEdgeTool = (
  deps: Pick<WorkflowToolDependencies, 'workflowVersionEdgeService'>,
  context: WorkflowToolContext,
) => ({
  name: 'delete_workflow_version_edge' as const,
  description: 'Delete a connection (edge) between workflow steps.',
  inputSchema: deleteWorkflowVersionEdgeSchema,
  execute: async (parameters: DeleteWorkflowVersionEdgeInput) => {
    try {
      return await deps.workflowVersionEdgeService.deleteWorkflowVersionEdge({
        source: parameters.source,
        target: parameters.target,
        workflowVersionId: parameters.workflowVersionId,
        workspaceId: context.workspaceId,
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to delete workflow version edge: ${error.message}`,
      };
    }
  },
});
