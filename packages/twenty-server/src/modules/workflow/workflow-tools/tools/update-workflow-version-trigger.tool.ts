import { workflowTriggerSchema } from 'twenty-shared/workflow';
import { z } from 'zod';

import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const updateWorkflowVersionTriggerSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID containing the trigger'),
  trigger: workflowTriggerSchema.describe('The updated trigger configuration'),
});

export const createUpdateWorkflowVersionTriggerTool = (
  deps: Pick<WorkflowToolDependencies, 'coreWorkflowVersionMutationService'>,
  context: WorkflowToolContext,
) => ({
  name: 'update_workflow_version_trigger' as const,
  description:
    'Update the trigger of a workflow version. This modifies the trigger configuration (e.g., changing trigger type, settings, or conditions).',
  inputSchema: updateWorkflowVersionTriggerSchema,
  execute: async (parameters: {
    coreWorkflowVersionId: string;
    trigger: WorkflowTrigger;
  }) => {
    try {
      const { trigger } =
        await deps.coreWorkflowVersionMutationService.updateTrigger({
          workspaceId: context.workspaceId,
          userWorkspaceId: context.userWorkspaceId,
          coreWorkflowVersionId: parameters.coreWorkflowVersionId,
          trigger: parameters.trigger,
        });

      return trigger;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to update workflow version trigger: ${error.message}`,
      };
    }
  },
});
