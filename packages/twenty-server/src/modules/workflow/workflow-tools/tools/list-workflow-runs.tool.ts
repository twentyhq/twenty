import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere } from 'typeorm';
import { z } from 'zod';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

type ListWorkflowRunsToolContext = WorkflowToolContext & {
  rolePermissionConfig: RolePermissionConfig;
};

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const listWorkflowRunsSchema = z.object({
  workflowId: z
    .uuid()
    .optional()
    .describe('Filter runs by the UUID of the workflow they belong to'),
  status: z
    .nativeEnum(WorkflowRunStatus)
    .optional()
    .describe(
      'Filter runs by status (e.g. FAILED to find runs that need troubleshooting)',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_LIMIT)
    .optional()
    .describe(`Maximum number of runs to return (default ${DEFAULT_LIMIT})`),
});

type ListWorkflowRunsInput = z.infer<typeof listWorkflowRunsSchema>;

export const createListWorkflowRunsTool = (
  deps: Pick<WorkflowToolDependencies, 'globalWorkspaceOrmManager'>,
  context: ListWorkflowRunsToolContext,
) => ({
  name: 'list_workflow_runs' as const,
  description:
    'List workflow runs, optionally filtered by workflow and/or status, ordered from most to least recent. Use this to find the relevant run (for example the latest failed run of a workflow) before inspecting it in detail with get_workflow_run.',
  inputSchema: listWorkflowRunsSchema,
  execute: async (parameters: ListWorkflowRunsInput) => {
    try {
      const authContext = buildSystemAuthContext(context.workspaceId);

      return await deps.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workflowRunRepository =
            await deps.globalWorkspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
              context.workspaceId,
              'workflowRun',
              context.rolePermissionConfig,
            );

          const where: FindOptionsWhere<WorkflowRunWorkspaceEntity> = {};

          if (isDefined(parameters.workflowId)) {
            where.workflowId = parameters.workflowId;
          }

          if (isDefined(parameters.status)) {
            where.status = parameters.status;
          }

          const workflowRuns = await workflowRunRepository.find({
            where,
            order: { createdAt: 'DESC' },
            take: parameters.limit ?? DEFAULT_LIMIT,
          });

          return {
            success: true,
            workflowRuns: workflowRuns.map((workflowRun) => ({
              id: workflowRun.id,
              name: workflowRun.name,
              status: workflowRun.status,
              error: workflowRun.state?.workflowRunError,
              startedAt: workflowRun.startedAt,
              endedAt: workflowRun.endedAt,
              workflowId: workflowRun.workflowId,
              workflowVersionId: workflowRun.workflowVersionId,
            })),
          };
        },
        authContext,
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to list workflow runs: ${error.message}`,
      };
    }
  },
});
