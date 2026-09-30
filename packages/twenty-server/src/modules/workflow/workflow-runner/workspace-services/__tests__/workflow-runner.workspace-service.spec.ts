import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { type WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { type WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import { type WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const THREAD_ID = 'thread-id';
const TOOL_PART = {
  id: 'part-id',
  messageId: 'question-message-id',
  turnId: 'question-turn-id',
};

describe('WorkflowRunnerWorkspaceService', () => {
  const messageQueueService = { add: jest.fn() };
  const workflowAgentConversationWorkspaceService = {
    recordAnswer: jest.fn().mockResolvedValue({ hasAwaitingToolCalls: false }),
  };

  const service = new WorkflowRunnerWorkspaceService(
    {} as WorkflowRunWorkspaceService,
    messageQueueService as unknown as MessageQueueService,
    {} as WorkflowVersionStepOperationsWorkspaceService,
    {} as WorkflowThrottlingWorkspaceService,
    {} as CoreWorkflowRunnerService,
    {} as WorkflowVersionCoreSyncService,
    workflowAgentConversationWorkspaceService as unknown as WorkflowAgentConversationWorkspaceService,
    {} as WorkflowExecutionContextService,
  );

  const resumeAnsweredAgentStep = () =>
    service.resumeAnsweredAgentStep({
      workspaceId: WORKSPACE_ID,
      workflowRunId: WORKFLOW_RUN_ID,
      stepId: 'agent-step-id',
      threadId: THREAD_ID,
      toolPart: TOOL_PART,
      toolResult: { success: true },
      answerText: 'Send it',
      senderUserWorkspaceId: 'user-workspace-id',
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resumeAnsweredAgentStep', () => {
    it('records the answer, then schedules an explicit resume of the step in its conversation', async () => {
      await resumeAnsweredAgentStep();

      expect(
        workflowAgentConversationWorkspaceService.recordAnswer,
      ).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        threadId: THREAD_ID,
        toolPart: TOOL_PART,
        toolResult: { success: true },
        answerText: 'Send it',
        senderUserWorkspaceId: 'user-workspace-id',
      });
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
        workflowAgentConversationWorkspaceService.recordAnswer.mock
          .invocationCallOrder[0],
      ).toBeLessThan(messageQueueService.add.mock.invocationCallOrder[0]);
    });

    it('schedules nothing while another call of the step still waits on its answer', async () => {
      workflowAgentConversationWorkspaceService.recordAnswer.mockResolvedValueOnce(
        { hasAwaitingToolCalls: true },
      );

      await resumeAnsweredAgentStep();

      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('schedules nothing when the answer cannot be recorded', async () => {
      workflowAgentConversationWorkspaceService.recordAnswer.mockRejectedValueOnce(
        new Error('History unavailable'),
      );

      await expect(resumeAnsweredAgentStep()).rejects.toThrow(
        'History unavailable',
      );
      expect(messageQueueService.add).not.toHaveBeenCalled();
    });
  });
});
