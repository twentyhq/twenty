import { workflowActionSchema } from 'twenty-shared/workflow';
import { z } from 'zod';

import type { UpdateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-step.input';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';
import { summarizeValidation } from 'src/modules/workflow/workflow-tools/utils/summarize-validation.util';

const updateWorkflowVersionStepSchema = z.object({
  workflowVersionId: z
    .string()
    .uuid()
    .describe('The UUID of the workflow version containing the step'),
  step: z
    .union([workflowActionSchema])
    .describe('The updated step configuration'),
  validate: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      'Run a quick validation and return a compact summary (default true). Set to false when making several edits in a row, then call validate_workflow once at the end instead.',
    ),
});

type UpdateWorkflowVersionStepToolInput = UpdateWorkflowVersionStepInput & {
  validate?: boolean;
};

export const createUpdateWorkflowVersionStepTool = (
  deps: Pick<
    WorkflowToolDependencies,
    'workflowVersionStepService' | 'workflowValidationService'
  >,
  context: WorkflowToolContext,
) => ({
  name: 'update_workflow_version_step' as const,
  description:
    'Update an existing step in a workflow version. This modifies the step configuration. Returns a compact validation summary; for the full report with available variable paths, call validate_workflow once after your edits — not after every change.',
  inputSchema: updateWorkflowVersionStepSchema,
  execute: async (parameters: UpdateWorkflowVersionStepToolInput) => {
    let result;

    try {
      result = await deps.workflowVersionStepService.updateWorkflowVersionStep({
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

    if (parameters.validate === false) {
      return result;
    }

    try {
      const validation =
        await deps.workflowValidationService.validateWorkflowVersion({
          workspaceId: context.workspaceId,
          workflowVersionId: parameters.workflowVersionId,
        });

      return {
        ...result,
        validation: summarizeValidation(validation),
      };
    } catch (error) {
      return {
        ...result,
        validationError: error.message,
        message: `Step updated successfully, but validation could not be computed: ${error.message}`,
      };
    }
  },
});
