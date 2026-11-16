import { z } from 'zod';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const runWorkflowVersionSchema = z.object({
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe(
      'The core workflow version UUID to run. A draft version can be run, which is how a workflow is tested before activating it.',
    ),
  payload: z
    .record(z.string(), z.unknown())
    .optional()
    .describe(
      'The trigger output the steps read as {{trigger.*}}. Omit for manual and scheduled triggers, as the Test button does. For a webhook trigger pass the request body; for a database event trigger pass { "properties": { "after": <record> } } ({ "properties": { "before": <record> } } for deleted events).',
    ),
});

type RunWorkflowVersionInput = z.infer<typeof runWorkflowVersionSchema>;

export const createRunWorkflowVersionTool = (
  deps: Pick<WorkflowToolDependencies, 'coreWorkflowVersionRunService'>,
  context: WorkflowToolContext,
) => ({
  name: 'run_workflow_version' as const,
  description:
    'Run a workflow version now, the same way the Test button in the workflow builder does. The run has real side effects: records are created or updated, emails are sent and HTTP requests are made, so confirm with the user before running a workflow that has them. The run is queued and executes in the background: follow it with get_workflow_run, which returns each step status, output and error.',
  inputSchema: runWorkflowVersionSchema,
  execute: async (parameters: RunWorkflowVersionInput) => {
    const { authContext } = context;

    if (!isUserAuthContext(authContext)) {
      return {
        success: false,
        error: 'Only a signed-in workspace member can run a workflow',
        message:
          'Failed to run workflow version: only a signed-in workspace member can run a workflow',
      };
    }

    try {
      const { workflowRunId } = await deps.coreWorkflowVersionRunService.run({
        authContext,
        coreWorkflowVersionId: parameters.coreWorkflowVersionId,
        payload: parameters.payload,
      });

      return {
        success: true,
        workflowRunId,
        message: `Workflow run ${workflowRunId} started. Call get_workflow_run with this id to follow it.`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to run workflow version: ${error.message}`,
      };
    }
  },
});
