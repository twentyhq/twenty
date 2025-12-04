import { z } from 'zod';

import { type WorkflowToolDependencies } from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

export const deactivateWorkflowVersionSchema = z.object({
  workflowVersionId: z
    .string()
    .describe('The ID of the workflow version to deactivate'),
});

export type DeactivateWorkflowVersionInput = z.infer<
  typeof deactivateWorkflowVersionSchema
>;

export const createDeactivateWorkflowVersionTool = (
  deps: Pick<WorkflowToolDependencies, 'workflowTriggerService'>,
) => ({
  name: 'deactivate_workflow_version' as const,
  description:
    'Deactivate a workflow version. This makes the workflow version inactive and unavailable for execution.',
  inputSchema: deactivateWorkflowVersionSchema,
  execute: async (parameters: DeactivateWorkflowVersionInput) => {
    try {
      return await deps.workflowTriggerService.deactivateWorkflowVersion(
        parameters.workflowVersionId,
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to deactivate workflow version: ${error.message}`,
      };
    }
  },
});
