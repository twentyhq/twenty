import { z } from 'zod';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowStatus,
  type WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const listWorkflowsSchema = z.object({
  status: z
    .nativeEnum(WorkflowStatus)
    .optional()
    .describe(
      'Optional filter by workflow status: DRAFT, ACTIVE, or DEACTIVATED',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(50)
    .describe('Maximum number of workflows to return (1-100, default 50)'),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0)
    .describe('Number of workflows to skip for pagination (default 0)'),
});

type ListWorkflowsInput = z.infer<typeof listWorkflowsSchema>;

export const createListWorkflowsTool = (
  deps: Pick<WorkflowToolDependencies, 'globalWorkspaceOrmManager'>,
  context: WorkflowToolContext,
) => ({
  name: 'list_workflows' as const,
  description:
    'List workflows in the workspace with optional filtering by status and pagination.',
  inputSchema: listWorkflowsSchema,
  execute: async (parameters: ListWorkflowsInput) => {
    try {
      const authContext = buildSystemAuthContext(context.workspaceId);

      return await deps.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workflowRepository =
            await deps.globalWorkspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
              context.workspaceId,
              'workflow',
              { shouldBypassPermissionChecks: true },
            );

          const where: Record<string, unknown> = {};

          if (parameters.status) {
            where.statuses = parameters.status;
          }

          const [workflows, totalCount] = await workflowRepository.findAndCount(
            {
              where,
              take: parameters.limit,
              skip: parameters.offset,
              order: { createdAt: 'DESC' },
            },
          );

          return {
            success: true,
            workflows: workflows.map((workflow) => ({
              id: workflow.id,
              name: workflow.name,
              statuses: workflow.statuses,
              lastPublishedVersionId: workflow.lastPublishedVersionId,
              createdAt: workflow.createdAt,
              updatedAt: workflow.updatedAt,
            })),
            totalCount,
            limit: parameters.limit,
            offset: parameters.offset,
          };
        },
        authContext,
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to list workflows: ${error.message}`,
      };
    }
  },
});
