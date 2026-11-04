import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WORKFLOW_TOOL_ACCESS_POLICY } from 'src/modules/workflow/workflow-tools/constants/workflow-tool-access-policy.constant';

const getWorkflowRunSchema = z.object({
  workflowRunId: z.uuid().describe('The UUID of the workflow run to inspect'),
});

const FAILED_STEP_STATUSES: StepStatus[] = [
  StepStatus.FAILED,
  StepStatus.FAILED_SAFELY,
];

@DefineTool({
  name: 'get_workflow_run',
  category: ToolCategory.WORKFLOW,
  description:
    'Get the details of a single workflow run for troubleshooting. Returns the overall status, the run-level error, the status and error of each step, and the execution logs of the steps that failed. Use this to diagnose why a workflow run failed or behaved unexpectedly.',
  accessPolicy: WORKFLOW_TOOL_ACCESS_POLICY,
  requiredApplicationReach: 'trigger',
  icon: 'IconSettingsAutomation',
})
export class GetWorkflowRunTool extends BaseTool<typeof getWorkflowRunSchema> {
  readonly inputSchema = getWorkflowRunSchema;

  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<typeof getWorkflowRunSchema>): Promise<ToolOutput> {
    try {
      return await this.workspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workflowRunRepository =
            this.workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
              'workflowRun',
            );

          const workflowRun = await workflowRunRepository.findOne({
            where: { id: parameters.workflowRunId },
          });

          if (!isDefined(workflowRun)) {
            return {
              success: false,
              error: `Workflow run ${parameters.workflowRunId} not found`,
              message: `Workflow run ${parameters.workflowRunId} not found`,
            };
          }

          const stepInfos = workflowRun.state?.stepInfos ?? {};

          const steps = (workflowRun.state?.flow?.steps ?? []).map((step) => {
            const stepInfo = stepInfos[step.id];

            return {
              id: step.id,
              name: step.name,
              type: step.type,
              status: stepInfo?.status,
              error: stepInfo?.error,
            };
          });

          const failedStepIds = Object.entries(stepInfos)
            .filter(([, stepInfo]) =>
              FAILED_STEP_STATUSES.includes(stepInfo.status),
            )
            .map(([stepId]) => stepId);

          const failedStepLogs = Object.fromEntries(
            Object.entries(workflowRun.stepLogs ?? {}).filter(([stepId]) =>
              failedStepIds.includes(stepId),
            ),
          );

          return {
            success: true,
            message: `Workflow run ${workflowRun.id} is ${workflowRun.status}`,
            result: {
              id: workflowRun.id,
              name: workflowRun.name,
              status: workflowRun.status,
              error: workflowRun.state?.workflowRunError,
              startedAt: workflowRun.startedAt,
              endedAt: workflowRun.endedAt,
              enqueuedAt: workflowRun.enqueuedAt,
              coreWorkflowId: workflowRun.coreWorkflowId,
              coreWorkflowVersionId: workflowRun.coreWorkflowVersionId,
              steps,
              failedStepLogs,
            },
          };
        },
        context.authContext,
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to get workflow run: ${error.message}`,
      };
    }
  }
}
