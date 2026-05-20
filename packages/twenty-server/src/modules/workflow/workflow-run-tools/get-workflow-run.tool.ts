import { z } from 'zod';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  type WorkflowRunToolContext,
  type WorkflowRunToolDependencies,
} from 'src/modules/workflow/workflow-run-tools/types/workflow-run-tool-dependencies.type';

const getWorkflowRunSchema = z.object({
  workflowRunId: z.string().uuid().describe('The id of the workflow run'),
});

type GetWorkflowRunParams = z.infer<typeof getWorkflowRunSchema>;

export const createGetWorkflowRunTool = (
  deps: Pick<WorkflowRunToolDependencies, 'globalWorkspaceOrmManager'>,
  context: WorkflowRunToolContext,
) => ({
  name: 'get_workflow_run' as const,
  description: `Fetch the full state of a workflow run, including per-step outputs and the workflow error if it failed. Use this to diagnose why a run did not complete.`,
  inputSchema: getWorkflowRunSchema,
  execute: async (parameters: GetWorkflowRunParams) => {
    try {
      const authContext = buildSystemAuthContext(context.workspaceId);

      const run =
        await deps.globalWorkspaceOrmManager.executeInWorkspaceContext(
          async () => {
            const repo =
              await deps.globalWorkspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
                context.workspaceId,
                'workflowRun',
                { shouldBypassPermissionChecks: true },
              );

            return repo.findOne({ where: { id: parameters.workflowRunId } });
          },
          authContext,
        );

      if (!run) {
        return {
          success: false,
          message: `Workflow run ${parameters.workflowRunId} not found`,
          error: 'not_found',
        };
      }

      return {
        success: true,
        message: `Workflow run ${run.id} (${run.status})`,
        result: {
          id: run.id,
          name: run.name,
          status: run.status,
          workflowId: run.workflowId,
          workflowVersionId: run.workflowVersionId,
          enqueuedAt: run.enqueuedAt,
          startedAt: run.startedAt,
          endedAt: run.endedAt,
          createdAt: run.createdAt,
          createdBy: run.createdBy,
          state: run.state,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to get workflow run: ${message}`,
        error: message,
      };
    }
  },
});
