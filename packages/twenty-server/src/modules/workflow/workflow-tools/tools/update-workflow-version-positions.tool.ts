import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';

const updateWorkflowVersionPositionsSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID'),
  positions: z
    .array(
      z.object({
        id: z.string().describe('Step or trigger ID'),
        position: z.object({
          x: z.number(),
          y: z.number(),
        }),
      }),
    )
    .describe('Array of step positions to update'),
});

@DefineTool({
  name: 'update_workflow_version_positions',
  category: ToolCategory.WORKFLOW,
  description:
    'Update the positions of multiple workflow steps. This is useful for reorganizing the workflow layout.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  requiredApplicationReach: 'trigger',
  icon: 'IconSettingsAutomation',
})
export class UpdateWorkflowVersionPositionsTool extends BaseTool<
  typeof updateWorkflowVersionPositionsSchema
> {
  readonly inputSchema = updateWorkflowVersionPositionsSchema;

  constructor(
    private readonly coreWorkflowVersionMutationService: CoreWorkflowVersionMutationWorkspaceService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<
    typeof updateWorkflowVersionPositionsSchema
  >): Promise<ToolOutput> {
    try {
      await this.coreWorkflowVersionMutationService.updatePositions({
        coreWorkflowVersionId: parameters.coreWorkflowVersionId,
        positions: parameters.positions,
        workspaceId: context.workspaceId,
        userWorkspaceId: context.userWorkspaceId,
      });

      return {
        success: true,
        message: 'Workflow version step positions updated',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to update workflow version step positions: ${error.message}`,
      };
    }
  }
}
