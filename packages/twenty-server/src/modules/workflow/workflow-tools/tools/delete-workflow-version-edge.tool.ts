import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';
import { workflowStepConnectionOptionsSchema } from 'src/modules/workflow/workflow-tools/tools/schemas/workflow-step-connection-options.schema';

const deleteWorkflowVersionEdgeSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID'),
  source: z
    .union([z.literal('trigger'), z.string().uuid()])
    .describe('The source step: "trigger" or a step UUID'),
  target: z.string().uuid().describe('The UUID of the target step'),
  sourceConnectionOptions: workflowStepConnectionOptionsSchema.optional(),
});

@DefineTool({
  name: 'delete_workflow_version_edge',
  category: ToolCategory.WORKFLOW,
  description: 'Delete a connection (edge) between workflow steps.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  requiredApplicationReach: 'trigger',
  icon: 'IconSettingsAutomation',
})
export class DeleteWorkflowVersionEdgeTool extends BaseTool<
  typeof deleteWorkflowVersionEdgeSchema
> {
  readonly inputSchema = deleteWorkflowVersionEdgeSchema;

  constructor(
    private readonly coreWorkflowVersionMutationService: CoreWorkflowVersionMutationWorkspaceService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<
    typeof deleteWorkflowVersionEdgeSchema
  >): Promise<ToolOutput> {
    try {
      return {
        success: true,
        message: 'Workflow version edge deleted',
        result: await this.coreWorkflowVersionMutationService.deleteEdge({
          source: parameters.source,
          target: parameters.target,
          coreWorkflowVersionId: parameters.coreWorkflowVersionId,
          workspaceId: context.workspaceId,
          userWorkspaceId: context.userWorkspaceId,
          sourceConnectionOptions: parameters.sourceConnectionOptions,
        }),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to delete workflow version edge: ${error.message}`,
      };
    }
  }
}
