import { z } from 'zod';

import { WorkflowVersionValidationException } from 'src/modules/workflow/workflow-builder/workflow-validation/exceptions/workflow-version-validation.exception';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const validateWorkflowSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID to validate'),
});

type ValidateWorkflowInput = z.infer<typeof validateWorkflowSchema>;

export const createValidateWorkflowTool = (
  deps: Pick<WorkflowToolDependencies, 'coreWorkflowLifecycleService'>,
  context: WorkflowToolContext,
) => ({
  name: 'validate_workflow' as const,
  description:
    'Check whether a workflow version can be activated, without activating it. Runs the exact check activation runs: graph topology (connections, reachability, branches, loops), per-step configuration, references to other objects, and variable references between steps. Succeeds when the version is ready; otherwise fails with the list of issues to fix. Does not modify the workflow.',
  inputSchema: validateWorkflowSchema,
  execute: async (parameters: ValidateWorkflowInput) => {
    try {
      await deps.coreWorkflowLifecycleService.validateCoreWorkflowVersion({
        workspaceId: context.workspaceId,
        coreWorkflowVersionId: parameters.coreWorkflowVersionId,
      });

      return {
        success: true,
        message: 'The workflow version can be activated.',
      };
    } catch (error) {
      if (error instanceof WorkflowVersionValidationException) {
        return {
          success: false,
          error: error.message,
          issues: error.issues.map(({ code, message, stepId }) => ({
            code,
            message,
            stepId,
          })),
          message: `The workflow version has ${error.issues.length} issue(s) to fix before it can be activated.`,
        };
      }

      return {
        success: false,
        error: error.message,
        message: `Failed to validate workflow: ${error.message}`,
      };
    }
  },
});
