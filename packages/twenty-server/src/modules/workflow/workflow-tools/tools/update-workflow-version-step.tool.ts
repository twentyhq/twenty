import { ToolCategory } from 'twenty-shared/ai';
import { workflowActionSchema } from 'twenty-shared/workflow';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { buildToolNotAvailableOutput } from 'src/engine/core-modules/tool-provider/utils/build-tool-not-available-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';
import { canCallerReachEveryApplication } from 'src/modules/workflow/workflow-tools/utils/can-caller-reach-every-application.util';

const updateWorkflowVersionStepSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID containing the step'),
  step: z
    .union([workflowActionSchema])
    .describe('The updated step configuration'),
});

@DefineTool({
  name: 'update_workflow_version_step',
  category: ToolCategory.WORKFLOW,
  description:
    'Update an existing step in a workflow version. This modifies the step configuration. For a CODE step, write its TypeScript source in settings.input.code: it must export `main` as an async arrow function, `export const main = async (params: { ... }) => { ... }`, whose params receive settings.input.logicFunctionInput. Call validate_workflow once after your edits are done, not after every change.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  icon: 'IconSettingsAutomation',
})
export class UpdateWorkflowVersionStepTool extends BaseTool<
  typeof updateWorkflowVersionStepSchema
> {
  readonly inputSchema = updateWorkflowVersionStepSchema;

  constructor(
    private readonly coreWorkflowVersionMutationService: CoreWorkflowVersionMutationWorkspaceService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<
    typeof updateWorkflowVersionStepSchema
  >): Promise<ToolOutput> {
    if (!canCallerReachEveryApplication(context)) {
      return buildToolNotAvailableOutput('update_workflow_version_step');
    }

    try {
      return {
        success: true,
        message: 'Workflow version step updated',
        result: await this.coreWorkflowVersionMutationService.updateStep({
          workspaceId: context.workspaceId,
          userWorkspaceId: context.userWorkspaceId,
          coreWorkflowVersionId: parameters.coreWorkflowVersionId,
          step: parameters.step as WorkflowAction,
        }),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to update workflow version step: ${error.message}`,
      };
    }
  }
}
