import { ToolCategory } from 'twenty-shared/ai';
import { workflowTriggerSchema } from 'twenty-shared/workflow';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { buildToolNotAvailableOutput } from 'src/engine/core-modules/tool-provider/utils/build-tool-not-available-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { canCallerReachEveryApplication } from 'src/modules/workflow/workflow-tools/utils/can-caller-reach-every-application.util';

const updateWorkflowVersionTriggerSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID containing the trigger'),
  trigger: workflowTriggerSchema.describe('The updated trigger configuration'),
});

@DefineTool({
  name: 'update_workflow_version_trigger',
  category: ToolCategory.WORKFLOW,
  description:
    'Update the trigger of a workflow version. This modifies the trigger configuration (e.g., changing trigger type, settings, or conditions).',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  icon: 'IconSettingsAutomation',
})
export class UpdateWorkflowVersionTriggerTool extends BaseTool<
  typeof updateWorkflowVersionTriggerSchema
> {
  readonly inputSchema = updateWorkflowVersionTriggerSchema;

  constructor(
    private readonly coreWorkflowVersionMutationService: CoreWorkflowVersionMutationWorkspaceService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<
    typeof updateWorkflowVersionTriggerSchema
  >): Promise<ToolOutput> {
    if (!canCallerReachEveryApplication(context)) {
      return buildToolNotAvailableOutput('update_workflow_version_trigger');
    }

    try {
      const { trigger } =
        await this.coreWorkflowVersionMutationService.updateTrigger({
          workspaceId: context.workspaceId,
          userWorkspaceId: context.userWorkspaceId,
          coreWorkflowVersionId: parameters.coreWorkflowVersionId,
          trigger: parameters.trigger as WorkflowTrigger,
        });

      return {
        success: true,
        message: 'Workflow version trigger updated',
        result: { trigger },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to update workflow version trigger: ${error.message}`,
      };
    }
  }
}
