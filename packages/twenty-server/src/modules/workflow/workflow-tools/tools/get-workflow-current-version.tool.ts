import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WorkflowVersionStatus as CoreWorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';

const getWorkflowCurrentVersionSchema = z.object({
  coreWorkflowId: z
    .string()
    .uuid()
    .describe(
      'The core workflow UUID to get the current version for, as returned by list_workflows',
    ),
});

@DefineTool({
  name: 'get_workflow_current_version',
  category: ToolCategory.WORKFLOW,
  description:
    'Get the current version of a workflow. Returns the draft version if one exists, otherwise the last published version. Returns a core workflow version ID (coreWorkflowVersionId), which the editing tools expect.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  requiredApplicationReach: 'trigger',
  icon: 'IconSettingsAutomation',
})
export class GetWorkflowCurrentVersionTool extends BaseTool<
  typeof getWorkflowCurrentVersionSchema
> {
  readonly inputSchema = getWorkflowCurrentVersionSchema;

  constructor(
    private readonly coreWorkflowListService: CoreWorkflowListService,
    private readonly coreWorkflowVersionListService: CoreWorkflowVersionListService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<
    typeof getWorkflowCurrentVersionSchema
  >): Promise<ToolOutput> {
    try {
      const { workspaceId } = context;
      const { coreWorkflowId } = parameters;

      const coreWorkflow = await this.coreWorkflowListService.findOneById({
        workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        coreWorkflowId,
      });

      if (!isDefined(coreWorkflow)) {
        return {
          success: false,
          error: `Workflow ${coreWorkflowId} not found`,
          message: `Workflow ${coreWorkflowId} not found`,
        };
      }

      const coreWorkflowVersions =
        await this.coreWorkflowVersionListService.findManyByCoreWorkflowId({
          workspaceId,
          userWorkspaceId: context.userWorkspaceId,
          coreWorkflowId,
        });

      const currentVersion =
        coreWorkflowVersions.find(
          (version) => version.status === CoreWorkflowVersionStatus.DRAFT,
        ) ??
        coreWorkflowVersions.find(
          (version) => version.status === CoreWorkflowVersionStatus.ACTIVE,
        ) ??
        coreWorkflowVersions.find(
          (version) => version.status === CoreWorkflowVersionStatus.DEACTIVATED,
        );

      if (!isDefined(currentVersion)) {
        return {
          success: false,
          error: `Workflow ${coreWorkflowId} has no draft, active or deactivated version`,
          message: `Workflow ${coreWorkflowId} has no draft, active or deactivated version`,
        };
      }

      const coreWorkflowVersion =
        await this.coreWorkflowVersionListService.findOneByCoreWorkflowVersionId(
          {
            workspaceId,
            userWorkspaceId: context.userWorkspaceId,
            coreWorkflowVersionId: currentVersion.id,
          },
        );

      if (!isDefined(coreWorkflowVersion)) {
        return {
          success: false,
          error: `Workflow version ${currentVersion.id} not found`,
          message: `Workflow version ${currentVersion.id} not found`,
        };
      }

      return {
        success: true,
        message: `Current version of workflow ${coreWorkflowId}`,
        result: {
          coreWorkflowVersionId: coreWorkflowVersion.id,
          name: coreWorkflowVersion.label,
          status: coreWorkflowVersion.status,
          trigger: coreWorkflowVersion.trigger,
          steps: coreWorkflowVersion.steps,
          coreWorkflowId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to get workflow current version: ${error.message}`,
      };
    }
  }
}
