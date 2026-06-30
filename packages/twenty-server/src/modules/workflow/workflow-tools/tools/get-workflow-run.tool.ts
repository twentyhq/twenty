import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { z } from 'zod';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

type GetWorkflowRunToolContext = WorkflowToolContext & {
  rolePermissionConfig: RolePermissionConfig;
};

const getWorkflowRunSchema = z.object({
  workflowRunId: z.uuid().describe('The UUID of the workflow run to inspect'),
});

type GetWorkflowRunInput = z.infer<typeof getWorkflowRunSchema>;

const FAILED_STEP_STATUSES: StepStatus[] = [
  StepStatus.FAILED,
  StepStatus.FAILED_SAFELY,
];

export const createGetWorkflowRunTool = (
  deps: Pick<WorkflowToolDependencies, 'globalWorkspaceOrmManager'>,
  context: GetWorkflowRunToolContext,
) => ({
  name: 'get_workflow_run' as const,
  description:
    'Get the details of a single workflow run for troubleshooting. Returns the overall status, the run-level error, the status and error of each step, and the execution logs of the steps that failed. Use this to diagnose why a workflow run failed or behaved unexpectedly.',
  inputSchema: getWorkflowRunSchema,
  execute: async (parameters: GetWorkflowRunInput) => {
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
              workflowId: workflowRun.workflowId,
              workflowVersionId: workflowRun.workflowVersionId,
              steps,
              failedStepLogs,
            },
          };
        },
        authContext,
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
