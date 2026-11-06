import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { buildToolNotAvailableOutput } from 'src/engine/core-modules/tool-provider/utils/build-tool-not-available-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { CoreWorkflowLifecycleWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';
import { canCallerReachEveryApplication } from 'src/modules/workflow/workflow-tools/utils/can-caller-reach-every-application.util';

const activateWorkflowVersionSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID to activate'),
});

@DefineTool({
  name: 'activate_workflow_version',
  category: ToolCategory.WORKFLOW,
  description:
    'Activate a workflow version. This makes the workflow version active and available for execution.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  icon: 'IconSettingsAutomation',
})
export class ActivateWorkflowVersionTool extends BaseTool<
  typeof activateWorkflowVersionSchema
> {
  readonly inputSchema = activateWorkflowVersionSchema;

  constructor(
    private readonly coreWorkflowLifecycleService: CoreWorkflowLifecycleWorkspaceService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<
    typeof activateWorkflowVersionSchema
  >): Promise<ToolOutput> {
    if (!canCallerReachEveryApplication(context)) {
      return buildToolNotAvailableOutput('activate_workflow_version');
    }

    try {
      await this.coreWorkflowLifecycleService.activateCoreWorkflowVersion({
        workspaceId: context.workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        coreWorkflowVersionId: parameters.coreWorkflowVersionId,
      });

      return { success: true, message: 'Workflow version activated' };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to activate workflow version: ${error.message}`,
      };
    }
  }
}
