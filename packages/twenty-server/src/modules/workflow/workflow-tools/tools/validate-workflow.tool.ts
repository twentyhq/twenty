import { z } from 'zod';

import { type WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowVersionValidationException } from 'src/modules/workflow/workflow-builder/workflow-validation/exceptions/workflow-version-validation.exception';
import { type WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation.workspace-service';
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
    workflowCommonService: WorkflowCommonWorkspaceService;
    workflowVersionValidationWorkspaceService: WorkflowVersionValidationWorkspaceService;
  },
  context: WorkflowToolContext,
) => ({
  name: 'validate_workflow' as const,
  description:
    'Check whether a workflow version can be activated, without activating it. Runs the exact check activation runs: graph topology (connections, reachability, branches, loops), per-step configuration, references to other objects, and variable references between steps. Succeeds when the version is ready; otherwise fails with the list of issues to fix. Does not modify the workflow.',
  inputSchema: validateWorkflowSchema,
  execute: async (parameters: ValidateWorkflowInput) => {
    try {
      const workflowVersion =
        await deps.workflowCommonService.getWorkflowVersionOrFail({
          workspaceId: context.workspaceId,
          workflowVersionId: parameters.workflowVersionId,
        });

      await deps.workflowVersionValidationWorkspaceService.assertWorkflowVersionIsActivableOrThrow(
        {
          workspaceId: context.workspaceId,
          trigger: workflowVersion.trigger,
          steps: workflowVersion.steps,
        },
      );

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
