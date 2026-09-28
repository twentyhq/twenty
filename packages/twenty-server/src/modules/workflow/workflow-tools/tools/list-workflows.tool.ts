import { z } from 'zod';

import {
  CoreWorkflowFilterFieldKey,
  CoreWorkflowFilterLogicalOperator,
  CoreWorkflowFilterOperand,
} from 'src/engine/core-modules/workflow/dtos/core-workflow-filter.input';
import {
  CoreWorkflowOrderByDirection,
  CoreWorkflowOrderByField,
} from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

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

type ListWorkflowsInput = z.infer<typeof listWorkflowsSchema>;

export const createListWorkflowsTool = (
  deps: Pick<WorkflowToolDependencies, 'coreWorkflowListService'>,
  context: WorkflowToolContext,
) => ({
  name: 'list_workflows' as const,
  description:
    'List all workflows in the workspace. Supports filtering by status and cursor pagination. Returns core workflow IDs (coreWorkflowId), which every other workflow tool expects. Use get_workflow_current_version to get the workflow current core version.',
  inputSchema: listWorkflowsSchema,
  execute: async (parameters: ListWorkflowsInput) => {
    try {
      const { edges, pageInfo, totalCount } =
        await deps.coreWorkflowListService.findManyByWorkspaceId({
          workspaceId: context.workspaceId,
          userWorkspaceId: context.userWorkspaceId,
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
  },
});
