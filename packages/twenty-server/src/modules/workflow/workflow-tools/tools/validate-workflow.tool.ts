import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { buildToolNotAvailableOutput } from 'src/engine/core-modules/tool-provider/utils/build-tool-not-available-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { CoreWorkflowLifecycleWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service';
import { WorkflowVersionValidationException } from 'src/modules/workflow/workflow-builder/workflow-validation/exceptions/workflow-version-validation.exception';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';
import { canCallerReachEveryApplication } from 'src/modules/workflow/workflow-tools/utils/can-caller-reach-every-application.util';

const validateWorkflowSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID to validate'),
});

@DefineTool({
  name: 'validate_workflow',
  category: ToolCategory.WORKFLOW,
  description:
    'Check whether a workflow version can be activated, without activating it. Runs the exact check activation runs: graph topology (connections, reachability, branches, loops), per-step configuration, references to other objects, and variable references between steps. Succeeds when the version is ready; otherwise fails with the list of issues to fix. Does not modify the workflow.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  icon: 'IconSettingsAutomation',
})
export class ValidateWorkflowTool extends BaseTool<
  typeof validateWorkflowSchema
> {
  readonly inputSchema = validateWorkflowSchema;

  constructor(
    private readonly coreWorkflowLifecycleService: CoreWorkflowLifecycleWorkspaceService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<typeof validateWorkflowSchema>): Promise<ToolOutput> {
    if (!canCallerReachEveryApplication(context)) {
      return buildToolNotAvailableOutput('validate_workflow');
    }

    try {
      await this.coreWorkflowLifecycleService.validateCoreWorkflowVersion({
        workspaceId: context.workspaceId,
        userWorkspaceId: context.userWorkspaceId,
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
          result: {
            issues: error.issues.map(({ code, message, stepId }) => ({
              code,
              message,
              stepId,
            })),
          },
          message: `The workflow version has ${error.issues.length} issue(s) to fix before it can be activated.`,
        };
      }

      return {
        success: false,
        error: error.message,
        message: `Failed to validate workflow: ${error.message}`,
      };
    }
  }
}
