import { z } from 'zod';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowStatus,
  type WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

type ListWorkflowsToolContext = WorkflowToolContext & {
  rolePermissionConfig: RolePermissionConfig;
};

const listWorkflowsSchema = z.object({
  status: z
    .nativeEnum(WorkflowStatus)
    .optional()
    .describe('Filter by status (DRAFT, ACTIVE, DEACTIVATED)'),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

type ListWorkflowsInput = z.infer<typeof listWorkflowsSchema>;

export const createListWorkflowsTool = (
  deps: Pick<WorkflowToolDependencies, 'globalWorkspaceOrmManager'>,
  context: ListWorkflowsToolContext,
) => ({
  name: 'list_workflows' as const,
  description:
    'List all workflows in the workspace. Supports filtering by status and pagination.',
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
              context.rolePermissionConfig,
            );

          const queryBuilder =
            workflowRepository.createQueryBuilder('workflow');

          if (parameters.status) {
            queryBuilder.where(':status = ANY(workflow.statuses)', {
              status: parameters.status,
            });
          }

          queryBuilder
            .orderBy('workflow.createdAt', 'DESC')
            .take(parameters.limit)
            .skip(parameters.offset);

          const [workflows, totalCount] = await queryBuilder.getManyAndCount();

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
