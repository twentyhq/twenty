import { z } from 'zod';

import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const activateWorkflowVersionSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID to activate'),
});

type ActivateWorkflowVersionInput = z.infer<
  typeof activateWorkflowVersionSchema
>;

export const createActivateWorkflowVersionTool = (
  deps: Pick<WorkflowToolDependencies, 'coreWorkflowLifecycleService'>,
  context: WorkflowToolContext,
) => ({
  name: 'activate_workflow_version' as const,
  description:
    'Activate a workflow version. This makes the workflow version active and available for execution.',
  inputSchema: activateWorkflowVersionSchema,
  execute: async (parameters: ActivateWorkflowVersionInput) => {
    try {
      return await deps.coreWorkflowLifecycleService.activateCoreWorkflowVersion(
        {
          workspaceId: context.workspaceId,
          coreWorkflowVersionId: parameters.coreWorkflowVersionId,
        },
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to activate workflow version: ${error.message}`,
      };
    }
  },
});
