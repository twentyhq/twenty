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

const deactivateWorkflowVersionSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID to deactivate'),
});

@DefineTool({
  name: 'deactivate_workflow_version',
  category: ToolCategory.WORKFLOW,
  description:
    'Deactivate a workflow version. This makes the workflow version inactive and unavailable for execution.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  icon: 'IconSettingsAutomation',
})
export class DeactivateWorkflowVersionTool extends BaseTool<
  typeof deactivateWorkflowVersionSchema
> {
  readonly inputSchema = deactivateWorkflowVersionSchema;

  constructor(
    private readonly coreWorkflowLifecycleService: CoreWorkflowLifecycleWorkspaceService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<
    typeof deactivateWorkflowVersionSchema
  >): Promise<ToolOutput> {
    if (!canCallerReachEveryApplication(context)) {
      return buildToolNotAvailableOutput('deactivate_workflow_version');
    }

    try {
      await this.coreWorkflowLifecycleService.deactivateCoreWorkflowVersion({
        workspaceId: context.workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        coreWorkflowVersionId: parameters.coreWorkflowVersionId,
      });

      return { success: true, message: 'Workflow version deactivated' };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to deactivate workflow version: ${error.message}`,
      };
    }
  }
}
