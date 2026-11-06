import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { z } from 'zod';

import { MAX_INLINE_TOOL_OUTPUT_BYTES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/max-inline-tool-output-bytes.constant';
import { jsonPreview } from 'src/engine/core-modules/tool/utils/json-preview.util';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const getWorkflowRunSchema = z.object({
  workflowRunId: z.uuid().describe('The UUID of the workflow run to inspect'),
});

type GetWorkflowRunInput = z.infer<typeof getWorkflowRunSchema>;

const FAILED_STEP_STATUSES: StepStatus[] = [
  StepStatus.FAILED,
  StepStatus.FAILED_SAFELY,
];

const boundStepOutput = (output: unknown) =>
  Buffer.byteLength(JSON.stringify(output) ?? '') > MAX_INLINE_TOOL_OUTPUT_BYTES
    ? { output: jsonPreview(output), isOutputTruncated: true }
    : { output };

export const createGetWorkflowRunTool = (
  deps: {
    workspaceOrmManager: Pick<
      WorkflowToolDependencies['workspaceOrmManager'],
      'executeInWorkspaceContext' | 'getRepository'
    >;
  },
  context: WorkflowToolContext,
) => ({
  name: 'get_workflow_run' as const,
  description:
    'Get the details of a single workflow run for troubleshooting. Returns the overall status, the run-level error, the status, output (a preview when large) and error of each step, and the execution logs of the steps that failed. Use this to diagnose why a workflow run failed or behaved unexpectedly.',
  inputSchema: getWorkflowRunSchema,
  execute: async (parameters: GetWorkflowRunInput) => {
    try {
      return await deps.workspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workflowRunRepository =
            deps.workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
              'workflowRun',
            );

          const workflowRun = await workflowRunRepository.findOne({
            where: { id: parameters.workflowRunId },
          });

          if (!isDefined(workflowRun)) {
            return {
              success: false,
              error: `Workflow run ${parameters.workflowRunId} not found`,
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
              ...boundStepOutput(stepInfo?.result),
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
            workflowRun: {
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
  },
});
