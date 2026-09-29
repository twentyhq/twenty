import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { type WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import { type WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const THREAD_ID = 'thread-id';

describe('WorkflowRunnerWorkspaceService', () => {
  const workflowRunWorkspaceService = { findStepAwaitingAnswer: jest.fn() };
  const messageQueueService = { add: jest.fn() };

  const service = new WorkflowRunnerWorkspaceService(
    workflowRunWorkspaceService as unknown as WorkflowRunWorkspaceService,
    messageQueueService as unknown as MessageQueueService,
    {} as WorkflowVersionStepOperationsWorkspaceService,
    {} as WorkflowThrottlingWorkspaceService,
    {} as CoreWorkflowRunnerService,
    {} as WorkflowVersionCoreSyncService,
  );

  const resumeAgentStepWithAnswer = () =>
    service.resumeAgentStepWithAnswer({
      threadId: THREAD_ID,
      workflowRunId: WORKFLOW_RUN_ID,
      workspaceId: WORKSPACE_ID,
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resumeAgentStepWithAnswer', () => {
    it('schedules an explicit resume of the step awaiting the answer', async () => {
      workflowRunWorkspaceService.findStepAwaitingAnswer.mockResolvedValue({
        status: 'AWAITING_ANSWER',
        stepId: 'agent-step-id',
      });

      expect(await resumeAgentStepWithAnswer()).toEqual({
        status: 'AWAITING_ANSWER',
        stepId: 'agent-step-id',
      });
      expect(messageQueueService.add).toHaveBeenCalledWith(
        RUN_WORKFLOW_JOB_NAME,
        {
          workspaceId: WORKSPACE_ID,
          workflowRunId: WORKFLOW_RUN_ID,
          stepIdToResume: 'agent-step-id',
        },
        expect.objectContaining({ id: WORKFLOW_RUN_ID }),
      );
    });

    it.each(['NOT_YET_AWAITING', 'NO_LONGER_AWAITING'])(
      'schedules nothing when the step is %s',
      async (status) => {
        workflowRunWorkspaceService.findStepAwaitingAnswer.mockResolvedValue({
          status,
        });

        expect(await resumeAgentStepWithAnswer()).toEqual({ status });
        expect(messageQueueService.add).not.toHaveBeenCalled();
      },
    );

    it('lets a failure to schedule the resume reach the caller', async () => {
      workflowRunWorkspaceService.findStepAwaitingAnswer.mockResolvedValue({
        status: 'AWAITING_ANSWER',
        stepId: 'agent-step-id',
      });
      messageQueueService.add.mockRejectedValueOnce(
        new Error('Queue unavailable'),
      );

      await expect(resumeAgentStepWithAnswer()).rejects.toThrow(
        'Queue unavailable',
      );
    });
  });
});
