import { z } from 'zod';

import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const deleteWorkflowVersionStepSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID containing the step'),
  stepId: z.string().uuid().describe('The UUID of the step to delete'),
});

type DeleteWorkflowVersionStepInput = z.infer<
  typeof deleteWorkflowVersionStepSchema
>;

export const createDeleteWorkflowVersionStepTool = (
  deps: Pick<WorkflowToolDependencies, 'coreWorkflowVersionMutationService'>,
  context: WorkflowToolContext,
) => ({
  name: 'delete_workflow_version_step' as const,
  description:
    'Delete a step from a workflow version. This removes the step and updates the workflow structure.',
  inputSchema: deleteWorkflowVersionStepSchema,
  execute: async (parameters: DeleteWorkflowVersionStepInput) => {
    try {
      return await deps.coreWorkflowVersionMutationService.deleteStep({
        workspaceId: context.workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        coreWorkflowVersionId: parameters.coreWorkflowVersionId,
        stepIdToDelete: parameters.stepId,
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to delete workflow version step: ${error.message}`,
      };
    }
  },
});
