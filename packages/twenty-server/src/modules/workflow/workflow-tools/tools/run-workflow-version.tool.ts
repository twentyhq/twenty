import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { buildToolNotAvailableOutput } from 'src/engine/core-modules/tool-provider/utils/build-tool-not-available-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { CoreWorkflowVersionRunService } from 'src/engine/core-modules/workflow/services/core-workflow-version-run.service';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';
import { canCallerReachEveryApplication } from 'src/modules/workflow/workflow-tools/utils/can-caller-reach-every-application.util';

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

@DefineTool({
  name: 'run_workflow_version',
  category: ToolCategory.WORKFLOW,
  description:
    'Run a workflow version now, the same way the Test button in the workflow builder does. The run has real side effects: records are created or updated, emails are sent and HTTP requests are made, so confirm with the user before running a workflow that has them. The run is queued and executes in the background: follow it with get_workflow_run, which returns each step status, output and error.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  icon: 'IconSettingsAutomation',
})
export class RunWorkflowVersionTool extends BaseTool<
  typeof runWorkflowVersionSchema
> {
  readonly inputSchema = runWorkflowVersionSchema;

  constructor(
    private readonly coreWorkflowVersionRunService: CoreWorkflowVersionRunService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<typeof runWorkflowVersionSchema>): Promise<ToolOutput> {
    if (!canCallerReachEveryApplication(context)) {
      return buildToolNotAvailableOutput('run_workflow_version');
    }

    const { authContext } = context;

    if (!isDefined(authContext) || !isUserAuthContext(authContext)) {
      return {
        success: false,
        error: 'Only a signed-in workspace member can run a workflow',
        message:
          'Failed to run workflow version: only a signed-in workspace member can run a workflow',
      };
    }

    try {
      const { workflowRunId } = await this.coreWorkflowVersionRunService.run({
        authContext,
        coreWorkflowVersionId: parameters.coreWorkflowVersionId,
        payload: parameters.payload,
      });

      return {
        success: true,
        message: `Workflow run ${workflowRunId} started. Call get_workflow_run with this id to follow it.`,
        result: { workflowRunId },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to run workflow version: ${error.message}`,
      };
    }
  }
}
