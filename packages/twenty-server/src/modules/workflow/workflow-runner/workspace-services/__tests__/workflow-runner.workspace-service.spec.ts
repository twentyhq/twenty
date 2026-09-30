import { WorkflowActionType } from 'twenty-shared/workflow';

import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { type WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import { type WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const THREAD_ID = 'thread-id';

const AGENT_STEP = {
  id: 'agent-step-id',
  type: WorkflowActionType.AI_AGENT,
} as WorkflowAction;

const FORM_STEP = {
  id: 'form-step-id',
  type: WorkflowActionType.FORM,
  settings: { input: [] },
} as unknown as WorkflowAction;

describe('WorkflowRunnerWorkspaceService', () => {
  const messageQueueService = { add: jest.fn() };
  const workflowRunWorkspaceService = {
    updateStepInfoIfPending: jest.fn().mockResolvedValue(true),
  };
  const workflowVersionStepOperationsWorkspaceService = {
    enrichFormStepResponse: jest
      .fn()
      .mockImplementation(async ({ response }) => ({
        ...response,
        enriched: true,
      })),
  };

  const service = new WorkflowRunnerWorkspaceService(
    workflowRunWorkspaceService as unknown as WorkflowRunWorkspaceService,
    messageQueueService as unknown as MessageQueueService,
    workflowVersionStepOperationsWorkspaceService as unknown as WorkflowVersionStepOperationsWorkspaceService,
    {} as WorkflowThrottlingWorkspaceService,
    {} as CoreWorkflowRunnerService,
    {} as WorkflowVersionCoreSyncService,
  );

  const resumeAnsweredStep = (step: WorkflowAction) =>
    service.resumeAnsweredStep({
      workspaceId: WORKSPACE_ID,
      workflowRunId: WORKFLOW_RUN_ID,
      step,
      threadId: THREAD_ID,
      response: { discount: 15 },
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resumeAnsweredStep', () => {
    it('schedules an explicit resume of an agent step in its conversation', async () => {
      await resumeAnsweredStep(AGENT_STEP);

      expect(messageQueueService.add).toHaveBeenCalledWith(
        RUN_WORKFLOW_JOB_NAME,
        {
          workspaceId: WORKSPACE_ID,
          workflowRunId: WORKFLOW_RUN_ID,
          stepToResume: { stepId: 'agent-step-id', threadId: THREAD_ID },
        },
        expect.objectContaining({ id: WORKFLOW_RUN_ID }),
      );
      expect(
        workflowRunWorkspaceService.updateStepInfoIfPending,
      ).not.toHaveBeenCalled();
    });

    it('completes a form step with its enriched answer, then resumes the run after it', async () => {
      await resumeAnsweredStep(FORM_STEP);

      expect(
        workflowRunWorkspaceService.updateStepInfoIfPending,
      ).toHaveBeenCalledWith({
        stepId: 'form-step-id',
        stepInfo: {
          status: 'SUCCESS',
          result: { discount: 15, enriched: true },
        },
        expectedThreadId: THREAD_ID,
        workspaceId: WORKSPACE_ID,
        workflowRunId: WORKFLOW_RUN_ID,
      });
      expect(messageQueueService.add).toHaveBeenCalledWith(
        RUN_WORKFLOW_JOB_NAME,
        {
          workspaceId: WORKSPACE_ID,
          workflowRunId: WORKFLOW_RUN_ID,
          lastExecutedStepId: 'form-step-id',
        },
        expect.objectContaining({ id: WORKFLOW_RUN_ID }),
      );
    });

    it('resumes nothing when the form step no longer waits on this conversation', async () => {
      workflowRunWorkspaceService.updateStepInfoIfPending.mockResolvedValueOnce(
        false,
      );

      await resumeAnsweredStep(FORM_STEP);

      expect(messageQueueService.add).not.toHaveBeenCalled();
    });
  });
});
