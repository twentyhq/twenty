import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';

const deleteWorkflowVersionStepSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID containing the step'),
  stepId: z.string().uuid().describe('The UUID of the step to delete'),
});

@DefineTool({
  name: 'delete_workflow_version_step',
  category: ToolCategory.WORKFLOW,
  description:
    'Delete a step from a workflow version. This removes the step and updates the workflow structure.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  requiredApplicationReach: 'trigger',
  icon: 'IconSettingsAutomation',
})
export class DeleteWorkflowVersionStepTool extends BaseTool<
  typeof deleteWorkflowVersionStepSchema
> {
  readonly inputSchema = deleteWorkflowVersionStepSchema;

  constructor(
    private readonly coreWorkflowVersionMutationService: CoreWorkflowVersionMutationWorkspaceService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<
    typeof deleteWorkflowVersionStepSchema
  >): Promise<ToolOutput> {
    try {
      return {
        success: true,
        message: 'Workflow version step deleted',
        result: await this.coreWorkflowVersionMutationService.deleteStep({
          workspaceId: context.workspaceId,
          userWorkspaceId: context.userWorkspaceId,
          coreWorkflowVersionId: parameters.coreWorkflowVersionId,
          stepIdToDelete: parameters.stepId,
        }),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to delete workflow version step: ${error.message}`,
      };
    }
  }
}
