import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';

const createDraftFromWorkflowVersionSchema = z.object({
  coreWorkflowId: z.string().uuid().describe('The core workflow UUID'),
  coreWorkflowVersionIdToCopy: z
    .string()
    .uuid()
    .describe('The core workflow version UUID to create a draft from'),
});

@DefineTool({
  name: 'create_draft_from_workflow_version',
  category: ToolCategory.WORKFLOW,
  description:
    'Create a new draft workflow version from an existing one. This allows for iterative workflow development. Returns the new core workflow version.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  requiredApplicationReach: 'trigger',
  icon: 'IconSettingsAutomation',
})
export class CreateDraftFromWorkflowVersionTool extends BaseTool<
  typeof createDraftFromWorkflowVersionSchema
> {
  readonly inputSchema = createDraftFromWorkflowVersionSchema;

  constructor(
    private readonly coreWorkflowVersionMutationService: CoreWorkflowVersionMutationWorkspaceService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<
    typeof createDraftFromWorkflowVersionSchema
  >): Promise<ToolOutput> {
    try {
      const coreWorkflowVersion =
        await this.coreWorkflowVersionMutationService.createDraftFromCoreWorkflowVersion(
          {
            workspaceId: context.workspaceId,
            userWorkspaceId: context.userWorkspaceId,
            coreWorkflowId: parameters.coreWorkflowId,
            coreWorkflowVersionIdToCopy: parameters.coreWorkflowVersionIdToCopy,
          },
        );

      return {
        success: true,
        message: `Draft created from workflow version ${parameters.coreWorkflowVersionIdToCopy}`,
        result: {
          coreWorkflowVersionId: coreWorkflowVersion.id,
          coreWorkflowId: parameters.coreWorkflowId,
          status: coreWorkflowVersion.status,
          name: coreWorkflowVersion.label,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to create draft from workflow version: ${error.message}`,
      };
    }
  }
}
