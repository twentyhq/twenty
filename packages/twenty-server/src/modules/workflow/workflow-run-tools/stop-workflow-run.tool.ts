import { z } from 'zod';

import {
  type WorkflowRunToolContext,
  type WorkflowRunToolDependencies,
} from 'src/modules/workflow/workflow-run-tools/types/workflow-run-tool-dependencies.type';

const stopWorkflowRunSchema = z.object({
  workflowRunId: z.string().uuid().describe('The id of the run to stop'),
});

type StopWorkflowRunParams = z.infer<typeof stopWorkflowRunSchema>;

export const createStopWorkflowRunTool = (
  deps: Pick<WorkflowRunToolDependencies, 'workflowTriggerWorkspaceService'>,
  context: WorkflowRunToolContext,
) => ({
  name: 'stop_workflow_run' as const,
  description: `Request that an in-progress workflow run stop. The run transitions to STOPPING and then STOPPED.`,
  inputSchema: stopWorkflowRunSchema,
  execute: async (parameters: StopWorkflowRunParams) => {
    try {
      const run = await deps.workflowTriggerWorkspaceService.stopWorkflowRun(
        parameters.workflowRunId,
        context.workspaceId,
      );

      return {
        success: true,
        message: `Stop requested for workflow run ${parameters.workflowRunId}`,
        result: {
          workflowRunId: parameters.workflowRunId,
          status: run?.status ?? null,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to stop workflow run: ${message}`,
        error: message,
      };
    }
  },
});
