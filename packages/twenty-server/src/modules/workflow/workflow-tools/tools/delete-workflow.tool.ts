import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { buildToolNotAvailableOutput } from 'src/engine/core-modules/tool-provider/utils/build-tool-not-available-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';
import { canCallerReachEveryApplication } from 'src/modules/workflow/workflow-tools/utils/can-caller-reach-every-application.util';

const deleteWorkflowSchema = z.object({
  coreWorkflowId: z
    .string()
    .uuid()
    .describe('The core workflow UUID to delete'),
});

@DefineTool({
  name: 'delete_workflow',
  category: ToolCategory.WORKFLOW,
  description:
    'Delete a workflow by its core workflow ID. This also removes its versions, runs and automated triggers, and deactivates any active version. Use list_workflows to find the coreWorkflowId.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  icon: 'IconSettingsAutomation',
})
export class DeleteWorkflowTool extends BaseTool<typeof deleteWorkflowSchema> {
  readonly inputSchema = deleteWorkflowSchema;

  constructor(
    private readonly coreWorkflowListService: CoreWorkflowListService,
    private readonly coreWorkflowMutationService: CoreWorkflowMutationWorkspaceService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<typeof deleteWorkflowSchema>): Promise<ToolOutput> {
    if (!canCallerReachEveryApplication(context)) {
      return buildToolNotAvailableOutput('delete_workflow');
    }

    try {
      const { coreWorkflowId } = parameters;
      const { workspaceId } = context;

      const coreWorkflow = await this.coreWorkflowListService.findOneById({
        workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        callerApplication: undefined,
        coreWorkflowId,
      });

      if (!isDefined(coreWorkflow)) {
        return {
          success: false,
          error: 'Workflow not found',
          message: `No workflow found with core ID ${coreWorkflowId}`,
        };
      }

      await this.coreWorkflowMutationService.deleteWorkflows({
        workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        coreWorkflowIds: [coreWorkflowId],
      });

      return {
        success: true,
        message: `Successfully deleted workflow ${coreWorkflowId}`,
        result: { coreWorkflowId },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        error: errorMessage,
        message: `Failed to delete workflow: ${errorMessage}`,
      };
    }
  }
}
