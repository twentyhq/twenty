import { workflowActionSchema } from 'twenty-shared/workflow';
import { z } from 'zod';

import type { UpdateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-step.input';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const updateWorkflowVersionStepSchema = z.object({
  workflowVersionId: z
    .string()
    .uuid()
    .describe('The UUID of the workflow version containing the step'),
  step: z
    .union([workflowActionSchema])
    .describe('The updated step configuration'),
});

export const createUpdateWorkflowVersionStepTool = (
  deps: Pick<
    WorkflowToolDependencies,
    'workflowVersionStepService' | 'workflowValidationService'
  >,
  context: WorkflowToolContext,
) => ({
  name: 'update_workflow_version_step' as const,
  description:
    'Update an existing step in a workflow version. This modifies the step configuration.',
  inputSchema: updateWorkflowVersionStepSchema,
  execute: async (parameters: UpdateWorkflowVersionStepInput) => {
    try {
      const result =
        await deps.workflowVersionStepService.updateWorkflowVersionStep({
          workspaceId: context.workspaceId,
          workflowVersionId: parameters.workflowVersionId,
          step: parameters.step,
        });

      const validation =
        await deps.workflowValidationService.validateWorkflowVersion({
          workspaceId: context.workspaceId,
          workflowVersionId: parameters.workflowVersionId,
        });

      return {
        ...result,
        validation,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to update workflow version step: ${error.message}`,
      };
    }
  },
});
