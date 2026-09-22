import { z } from 'zod';

import { workflowStepConnectionOptionsSchema } from 'src/modules/workflow/workflow-tools/tools/schemas/workflow-step-connection-options.schema';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const deleteWorkflowVersionEdgeSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID'),
  source: z
    .union([z.literal('trigger'), z.string().uuid()])
    .describe('The source step: "trigger" or a step UUID'),
  target: z.string().uuid().describe('The UUID of the target step'),
  sourceConnectionOptions: workflowStepConnectionOptionsSchema.optional(),
});

type DeleteWorkflowVersionEdgeInput = z.infer<
  typeof deleteWorkflowVersionEdgeSchema
>;

export const createDeleteWorkflowVersionEdgeTool = (
  deps: Pick<WorkflowToolDependencies, 'coreWorkflowVersionMutationService'>,
  context: WorkflowToolContext,
) => ({
  name: 'delete_workflow_version_edge' as const,
  description: 'Delete a connection (edge) between workflow steps.',
  inputSchema: deleteWorkflowVersionEdgeSchema,
  execute: async (parameters: DeleteWorkflowVersionEdgeInput) => {
    try {
      return await deps.coreWorkflowVersionMutationService.deleteEdge({
        source: parameters.source,
        target: parameters.target,
        coreWorkflowVersionId: parameters.coreWorkflowVersionId,
        workspaceId: context.workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        sourceConnectionOptions: parameters.sourceConnectionOptions,
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
