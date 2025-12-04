import {
  workflowActionSchema,
  workflowTriggerSchema,
} from 'twenty-shared/workflow';
import { z } from 'zod';

import type { UpdateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-step-input.dto';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const updateWorkflowVersionStepSchema = z.object({
  workflowVersionId: z
    .string()
    .describe('The ID of the workflow version containing the step'),
  step: z
    .union([workflowTriggerSchema, workflowActionSchema])
    .describe('The updated step configuration'),
});

export const createUpdateWorkflowVersionStepTool = (
  deps: Pick<WorkflowToolDependencies, 'workflowVersionStepService'>,
  context: WorkflowToolContext,
) => ({
  name: 'update_workflow_version_step' as const,
  description:
    'Update an existing step in a workflow version. This modifies the step configuration.',
  inputSchema: updateWorkflowVersionStepSchema,
  execute: async (parameters: UpdateWorkflowVersionStepInput) => {
    try {
      return await deps.workflowVersionStepService.updateWorkflowVersionStep({
        workspaceId: context.workspaceId,
        workflowVersionId: parameters.workflowVersionId,
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
