import {
  StepStatus,
  type WorkflowRunStepInfos,
  type WorkflowRunStepLog,
} from 'twenty-shared/workflow';

import { type WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { type BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { type UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const AGENT_STEP_ID = 'agent-step-id';

describe('WorkflowExecutorWorkspaceService', () => {
  const workflowRunWorkspaceService = {
    getWorkflowRunOrFail: jest.fn(),
    updateWorkflowRunStepInfo: jest.fn(),
    endWorkflowRun: jest.fn(),
  };

  const workflowAction = { execute: jest.fn() };

  const billingUsageService = { assertUsageAllowed: jest.fn() };
  const usageLimitQuotaService = { consumeQuota: jest.fn() };
  const usageRecorderService = { record: jest.fn() };

  const service = new WorkflowExecutorWorkspaceService(
    {
      findCoreWorkflowById: jest.fn().mockResolvedValue({
        id: 'workflow-id',
        workspaceWorkflowId: 'workflow-id',
        applicationId: 'application-id',
      }),
    } as unknown as WorkflowCoreSyncService,
    {
      get: jest.fn().mockReturnValue(workflowAction),
    } as unknown as WorkflowActionFactory,
    usageRecorderService as unknown as UsageRecorderService,
    workflowRunWorkspaceService as unknown as WorkflowRunWorkspaceService,
    billingUsageService as unknown as BillingUsageService,
    usageLimitQuotaService as unknown as UsageLimitQuotaService,
    {
      isFeatureEnabled: jest.fn().mockResolvedValue(true),
    } as unknown as FeatureFlagService,
    {} as ExceptionHandlerService,
    {} as MetricsService,
    {} as MessageQueueService,
  );

  const previousStepLog = {
    status: 'SUCCESS',
    details: { type: 'AI_AGENT' },
  } as unknown as WorkflowRunStepLog;

  const mockWorkflowRun = (stepInfos: WorkflowRunStepInfos) =>
    workflowRunWorkspaceService.getWorkflowRunOrFail.mockResolvedValue({
      id: WORKFLOW_RUN_ID,
      status: WorkflowRunStatus.RUNNING,
      coreWorkflowId: 'workflow-id',
      stepLogs: { [AGENT_STEP_ID]: previousStepLog },
      state: {
        flow: {
          steps: [
            {
              id: AGENT_STEP_ID,
              type: 'AI_AGENT',
              nextStepIds: [],
              settings: {},
            },
          ],
        },
        stepInfos: {
          trigger: { status: StepStatus.SUCCESS, result: {} },
          ...stepInfos,
        },
      },
    });

  beforeEach(() => {
    jest.clearAllMocks();
    workflowAction.execute.mockResolvedValue({ result: { response: 'done' } });
  });

  describe('executeFromSteps', () => {
    it('runs a resumed step without charging it or checking the quota again', async () => {
      mockWorkflowRun({
        [AGENT_STEP_ID]: { status: StepStatus.RUNNING, threadId: 'thread' },
      });

      await service.executeFromSteps({
        stepIds: [AGENT_STEP_ID],
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
        resumedThreadId: 'thread',
      });

      expect(workflowAction.execute).toHaveBeenCalledTimes(1);
      expect(workflowAction.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStepId: AGENT_STEP_ID,
          resumedThreadId: 'thread',
          previousStepLog,
        }),
      );
      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfo,
      ).toHaveBeenLastCalledWith({
        stepId: AGENT_STEP_ID,
        stepInfo: { status: StepStatus.SUCCESS, result: { response: 'done' } },
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });
      expect(billingUsageService.assertUsageAllowed).not.toHaveBeenCalled();
      expect(usageLimitQuotaService.consumeQuota).not.toHaveBeenCalled();
      expect(usageRecorderService.record).not.toHaveBeenCalled();
    });

    it('charges a step it runs, whatever conversation it holds', async () => {
      mockWorkflowRun({
        [AGENT_STEP_ID]: { status: StepStatus.NOT_STARTED, threadId: 'thread' },
      });

      await service.executeFromSteps({
        stepIds: [AGENT_STEP_ID],
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(workflowAction.execute).toHaveBeenCalledTimes(1);
      expect(workflowAction.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          resumedThreadId: undefined,
          previousStepLog: undefined,
        }),
      );
      expect(billingUsageService.assertUsageAllowed).toHaveBeenCalledTimes(1);
      expect(usageLimitQuotaService.consumeQuota).toHaveBeenCalledTimes(1);
      expect(usageRecorderService.record).toHaveBeenCalledTimes(1);
    });

    it('leaves a step waiting for its answer to the resume', async () => {
      mockWorkflowRun({
        [AGENT_STEP_ID]: { status: StepStatus.PENDING, threadId: 'thread' },
      });

      await service.executeFromSteps({
        stepIds: [AGENT_STEP_ID],
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(workflowAction.execute).not.toHaveBeenCalled();
      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfo,
      ).not.toHaveBeenCalled();
      expect(workflowRunWorkspaceService.endWorkflowRun).not.toHaveBeenCalled();
    });
  });
});
