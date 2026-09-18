import { z } from 'zod';

import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const deactivateWorkflowVersionSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID to deactivate'),
});

type DeactivateWorkflowVersionInput = z.infer<
  typeof deactivateWorkflowVersionSchema
>;

export const createDeactivateWorkflowVersionTool = (
  deps: Pick<WorkflowToolDependencies, 'coreWorkflowLifecycleService'>,
  context: WorkflowToolContext,
) => ({
  name: 'deactivate_workflow_version' as const,
  description:
    'Deactivate a workflow version. This makes the workflow version inactive and unavailable for execution.',
  inputSchema: deactivateWorkflowVersionSchema,
  execute: async (parameters: DeactivateWorkflowVersionInput) => {
    try {
      return await deps.coreWorkflowLifecycleService.deactivateCoreWorkflowVersion(
        {
          workspaceId: context.workspaceId,
          coreWorkflowVersionId: parameters.coreWorkflowVersionId,
        },
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
