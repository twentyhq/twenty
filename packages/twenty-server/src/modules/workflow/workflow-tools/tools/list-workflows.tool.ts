import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { buildToolNotAvailableOutput } from 'src/engine/core-modules/tool-provider/utils/build-tool-not-available-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import {
  CoreWorkflowFilterFieldKey,
  CoreWorkflowFilterLogicalOperator,
  CoreWorkflowFilterOperand,
} from 'src/engine/core-modules/workflow/dtos/core-workflow-filter.input';
import {
  CoreWorkflowOrderByDirection,
  CoreWorkflowOrderByField,
} from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';
import { canCallerReachEveryApplication } from 'src/modules/workflow/workflow-tools/utils/can-caller-reach-every-application.util';

const DEFAULT_LIST_WORKFLOWS_LIMIT = 50;

const listWorkflowsSchema = z.object({
  status: z
    .nativeEnum(WorkflowStatus)
    .optional()
    .describe('Filter by status (DRAFT, ACTIVE, DEACTIVATED)'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(DEFAULT_LIST_WORKFLOWS_LIMIT),
  after: z
    .string()
    .optional()
    .describe(
      'Cursor returned as endCursor by a previous call, to fetch the next page',
    ),
});

@DefineTool({
  name: 'list_workflows',
  category: ToolCategory.WORKFLOW,
  description:
    'List all workflows in the workspace. Supports filtering by status and cursor pagination. Returns core workflow IDs (coreWorkflowId), which every other workflow tool expects. Use get_workflow_current_version to get the workflow current core version.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  icon: 'IconSettingsAutomation',
})
export class ListWorkflowsTool extends BaseTool<typeof listWorkflowsSchema> {
  readonly inputSchema = listWorkflowsSchema;

  constructor(
    private readonly coreWorkflowListService: CoreWorkflowListService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<typeof listWorkflowsSchema>): Promise<ToolOutput> {
    if (!canCallerReachEveryApplication(context)) {
      return buildToolNotAvailableOutput('list_workflows');
    }

    try {
      const { edges, pageInfo, totalCount } =
        await this.coreWorkflowListService.findManyByWorkspaceId({
          workspaceId: context.workspaceId,
          userWorkspaceId: context.userWorkspaceId,
          callerApplication: undefined,
          first: parameters.limit ?? DEFAULT_LIST_WORKFLOWS_LIMIT,
          after: parameters.after,
          orderBy: CoreWorkflowOrderByField.UPDATED_AT,
          orderByDirection: CoreWorkflowOrderByDirection.DESC,
          filter: parameters.status
            ? {
                logicalOperator: CoreWorkflowFilterLogicalOperator.AND,
                rules: [
                  {
                    fieldKey: CoreWorkflowFilterFieldKey.STATUSES,
                    operand: CoreWorkflowFilterOperand.CONTAINS,
                    value: JSON.stringify([parameters.status]),
                  },
                ],
              }
            : undefined,
        });

      return {
        success: true,
        message: `Found ${totalCount} workflow(s)`,
        result: {
          workflows: edges.map(({ node }) => ({
            coreWorkflowId: node.id,
            name: node.name,
            statuses: node.statuses,
            createdAt: node.createdAt,
            updatedAt: node.updatedAt,
          })),
          totalCount,
          endCursor: pageInfo.endCursor,
          hasNextPage: pageInfo.hasNextPage,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        error: errorMessage,
        message: `Failed to list workflows: ${errorMessage}`,
      };
    }
  }
}
