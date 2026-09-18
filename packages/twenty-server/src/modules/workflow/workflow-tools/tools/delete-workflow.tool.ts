import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const deleteWorkflowSchema = z.object({
  coreWorkflowId: z
    .string()
    .uuid()
    .describe('The core workflow UUID to delete'),
});

type DeleteWorkflowInput = z.infer<typeof deleteWorkflowSchema>;

export const createDeleteWorkflowTool = (
  deps: Pick<
    WorkflowToolDependencies,
    'coreWorkflowListService' | 'coreWorkflowMutationService'
  >,
  context: WorkflowToolContext,
) => ({
  name: 'delete_workflow' as const,
  description:
    'Delete a workflow by its core workflow ID. This also removes its versions, runs and automated triggers, and deactivates any active version. Use list_workflows to find the coreWorkflowId.',
  inputSchema: deleteWorkflowSchema,
  execute: async (parameters: DeleteWorkflowInput) => {
    try {
      const { coreWorkflowId } = parameters;
      const { workspaceId } = context;

      const coreWorkflow = await deps.coreWorkflowListService.findOneById({
        workspaceId,
        coreWorkflowId,
      });

      if (!isDefined(coreWorkflow)) {
        return {
          success: false,
          error: 'Workflow not found',
          message: `No workflow found with core ID ${coreWorkflowId}`,
        };
      }

      await deps.coreWorkflowMutationService.deleteWorkflows(workspaceId, {
        coreWorkflowIds: [coreWorkflowId],
      });

      return {
        success: true,
        message: `Successfully deleted workflow ${coreWorkflowId}`,
        coreWorkflowId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        error: errorMessage,
        message: `Failed to delete workflow: ${errorMessage}`,
      };
    }
  },
});
