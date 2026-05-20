import { z } from 'zod';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { workflowRunStatusSchema } from 'src/modules/workflow/workflow-run-tools/schemas/workflow-run.schema';
import {
  type WorkflowRunToolContext,
  type WorkflowRunToolDependencies,
} from 'src/modules/workflow/workflow-run-tools/types/workflow-run-tool-dependencies.type';

const listWorkflowRunsSchema = z.object({
  workflowId: z
    .string()
    .uuid()
    .optional()
    .describe('Restrict to runs of a specific workflow'),
  workflowVersionId: z
    .string()
    .uuid()
    .optional()
    .describe('Restrict to runs of a specific workflow version'),
  status: workflowRunStatusSchema
    .optional()
    .describe(
      'Filter by run status (ENQUEUED, RUNNING, COMPLETED, FAILED, STOPPED, ...)',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe('Max number of runs to return (default 20, max 100)'),
});

type ListWorkflowRunsParams = z.infer<typeof listWorkflowRunsSchema>;

export const createListWorkflowRunsTool = (
  deps: Pick<WorkflowRunToolDependencies, 'globalWorkspaceOrmManager'>,
  context: WorkflowRunToolContext,
) => ({
  name: 'list_workflow_runs' as const,
  description: `List workflow runs, optionally filtered by workflow, version, or status. Returns metadata only; use get_workflow_run for full state including step outputs.`,
  inputSchema: listWorkflowRunsSchema,
  execute: async (parameters: ListWorkflowRunsParams) => {
    try {
      const authContext = buildSystemAuthContext(context.workspaceId);
      const where: Partial<{
        workflowId: string;
        workflowVersionId: string;
        status: WorkflowRunStatus;
      }> = {};

      if (parameters.workflowId) {
        where.workflowId = parameters.workflowId;
      }
      if (parameters.workflowVersionId) {
        where.workflowVersionId = parameters.workflowVersionId;
      }
      if (parameters.status) {
        where.status = parameters.status as WorkflowRunStatus;
      }

      const runs =
        await deps.globalWorkspaceOrmManager.executeInWorkspaceContext(
          async () => {
            const repo =
              await deps.globalWorkspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
                context.workspaceId,
                'workflowRun',
                { shouldBypassPermissionChecks: true },
              );

            return repo.find({
              where,
              take: parameters.limit ?? 20,
              order: { createdAt: 'DESC' },
            });
          },
          authContext,
        );

      return {
        success: true,
        message: `Found ${runs.length} workflow run(s)`,
        result: {
          runs: runs.map((run) => ({
            id: run.id,
            name: run.name,
            status: run.status,
            workflowId: run.workflowId,
            workflowVersionId: run.workflowVersionId,
            enqueuedAt: run.enqueuedAt,
            startedAt: run.startedAt,
            endedAt: run.endedAt,
            createdAt: run.createdAt,
          })),
          count: runs.length,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to list workflow runs: ${message}`,
        error: message,
      };
    }
  },
});
