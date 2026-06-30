import { z } from 'zod';

import { type WorkflowValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-validation.workspace-service';
import { type WorkflowToolContext } from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const validateWorkflowSchema = z.object({
  workflowVersionId: z
    .string()
    .uuid()
    .describe('The UUID of the workflow version to validate'),
});

type ValidateWorkflowInput = z.infer<typeof validateWorkflowSchema>;

export const createValidateWorkflowTool = (
  deps: {
    workflowValidationService: WorkflowValidationWorkspaceService;
  },
  context: WorkflowToolContext,
) => ({
  name: 'validate_workflow' as const,
  description:
    'Validate a workflow version for correctness. Checks graph topology (connections, reachability, branches, loops), per-step configuration, references to other objects, and variable references between steps. Returns a list of errors and warnings to fix. Does not block or modify the workflow.',
  inputSchema: validateWorkflowSchema,
  execute: async (parameters: ValidateWorkflowInput) => {
    try {
      const result =
        await deps.workflowValidationService.validateWorkflowVersion({
          workspaceId: context.workspaceId,
          workflowVersionId: parameters.workflowVersionId,
        });

      return {
        success: true,
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings,
        message: result.valid
          ? 'The workflow is valid.'
          : `The workflow has ${result.errors.length} error(s) that should be fixed.`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to validate workflow: ${error.message}`,
      };
    }
  },
});
