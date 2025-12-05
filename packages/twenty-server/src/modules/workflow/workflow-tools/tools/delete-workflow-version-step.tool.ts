import { z } from 'zod';

import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const deleteWorkflowVersionStepSchema = z.object({
  workflowVersionId: z
    .string()
    .describe('The ID of the workflow version containing the step'),
  stepId: z.string().describe('The ID of the step to delete'),
});

type DeleteWorkflowVersionStepInput = z.infer<
  typeof deleteWorkflowVersionStepSchema
>;

export const createDeleteWorkflowVersionStepTool = (
  deps: Pick<WorkflowToolDependencies, 'workflowVersionStepService'>,
  context: WorkflowToolContext,
) => ({
  name: 'delete_workflow_version_step' as const,
  description:
    'Delete a step from a workflow version. This removes the step and updates the workflow structure.',
  inputSchema: deleteWorkflowVersionStepSchema,
  execute: async (parameters: DeleteWorkflowVersionStepInput) => {
    try {
      return await deps.workflowVersionStepService.deleteWorkflowVersionStep({
        workspaceId: context.workspaceId,
        workflowVersionId: parameters.workflowVersionId,
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
