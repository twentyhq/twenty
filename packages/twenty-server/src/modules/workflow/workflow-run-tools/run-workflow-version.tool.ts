import { z } from 'zod';

import {
  type WorkflowRunToolContext,
  type WorkflowRunToolDependencies,
} from 'src/modules/workflow/workflow-run-tools/types/workflow-run-tool-dependencies.type';

const runWorkflowVersionSchema = z.object({
  workflowVersionId: z
    .string()
    .uuid()
    .describe('The workflow version id to execute'),
  payload: z
    .record(z.string(), z.unknown())
    .optional()
    .describe(
      'Optional payload passed to the workflow trigger (shape depends on the trigger type)',
    ),
});

type RunWorkflowVersionParams = z.infer<typeof runWorkflowVersionSchema>;

export const createRunWorkflowVersionTool = (
  deps: Pick<WorkflowRunToolDependencies, 'workflowTriggerWorkspaceService'>,
  context: WorkflowRunToolContext,
) => ({
  name: 'run_workflow_version' as const,
  description: `Manually trigger a run of a specific workflow version. Returns the new workflowRunId; chain into get_workflow_run to inspect the outcome.`,
  inputSchema: runWorkflowVersionSchema,
  execute: async (parameters: RunWorkflowVersionParams) => {
    try {
      if (!context.actorContext) {
        return {
          success: false,
          message:
            'Cannot trigger a workflow run without an authenticated actor context.',
          error: 'missing_actor_context',
        };
      }

      const result =
        await deps.workflowTriggerWorkspaceService.runWorkflowVersion({
          workflowVersionId: parameters.workflowVersionId,
          payload: parameters.payload ?? {},
          createdBy: context.actorContext,
          workspaceId: context.workspaceId,
        });

      return {
        success: true,
        message: `Workflow version ${parameters.workflowVersionId} triggered`,
        result: { workflowRunId: result.workflowRunId },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to run workflow version: ${message}`,
        error: message,
      };
    }
  },
});
