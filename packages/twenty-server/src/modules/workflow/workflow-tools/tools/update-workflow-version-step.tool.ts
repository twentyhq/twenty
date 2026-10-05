import { workflowActionSchema } from 'twenty-shared/workflow';
import { z } from 'zod';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const updateWorkflowVersionStepSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID containing the step'),
  step: z
    .union([workflowActionSchema])
    .describe('The updated step configuration'),
});

export const createUpdateWorkflowVersionStepTool = (
  deps: Pick<WorkflowToolDependencies, 'coreWorkflowVersionMutationService'>,
  context: WorkflowToolContext,
) => ({
  name: 'update_workflow_version_step' as const,
  description:
    'Update an existing step in a workflow version. This modifies the step configuration. Call validate_workflow once after your edits are done, not after every change.',
  inputSchema: updateWorkflowVersionStepSchema,
  execute: async (parameters: {
    coreWorkflowVersionId: string;
    step: WorkflowAction;
  }) => {
    try {
      return await deps.coreWorkflowVersionMutationService.updateStep({
        workspaceId: context.workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        coreWorkflowVersionId: parameters.coreWorkflowVersionId,
        step: parameters.step,
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to update workflow version step: ${error.message}`,
      };
    }
  },
});
