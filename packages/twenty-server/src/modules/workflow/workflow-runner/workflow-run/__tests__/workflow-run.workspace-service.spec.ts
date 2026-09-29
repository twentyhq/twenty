import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { type WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const AGENT_STEP_ID = 'agent-step-id';
const THREAD_ID = 'thread-id';

describe('WorkflowRunWorkspaceService', () => {
  const threadRepository = { find: jest.fn(), update: jest.fn() };
  const messagePartRepository = { find: jest.fn(), update: jest.fn() };

  const service = Object.assign(
    new WorkflowRunWorkspaceService(
      {} as WorkspaceOrmManager,
      {} as RecordPositionService,
      {
        incrementCounterForEvent: jest.fn(),
      } as unknown as MetricsService,
      {} as WorkflowRunRecordShareService,
      threadRepository as unknown as AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
      messagePartRepository as unknown as AgentHistoryRepository<AgentMessagePartEntity>,
    ),
    {
      cacheLockService: {
        withLock: (callback: () => Promise<unknown>) => callback(),
      },
    },
  );

  const getWorkflowRunOrFail = jest.spyOn(service, 'getWorkflowRunOrFail');
  const updateWorkflowRun = jest.spyOn(service, 'updateWorkflowRun');

  const mockWorkflowRun = ({
    status = WorkflowRunStatus.RUNNING,
    stepInfos,
  }: {
    status?: WorkflowRunStatus;
    stepInfos: WorkflowRunStepInfos;
  }) =>
    getWorkflowRunOrFail.mockResolvedValue({
      id: WORKFLOW_RUN_ID,
      status,
      state: { stepInfos },
    } as unknown as WorkflowRunWorkspaceEntity);

  const findStepAwaitingAnswer = () =>
    service.findStepAwaitingAnswer({
      threadId: THREAD_ID,
      workflowRunId: WORKFLOW_RUN_ID,
      workspaceId: WORKSPACE_ID,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    updateWorkflowRun.mockResolvedValue(undefined);
  });

  describe('findStepAwaitingAnswer', () => {
    it('finds the PENDING step holding the conversation and leaves it PENDING', async () => {
      mockWorkflowRun({
        stepInfos: {
          [AGENT_STEP_ID]: { status: StepStatus.PENDING, threadId: THREAD_ID },
        },
      });

      expect(await findStepAwaitingAnswer()).toEqual({
        status: 'AWAITING_ANSWER',
        stepId: AGENT_STEP_ID,
      });
      expect(updateWorkflowRun).not.toHaveBeenCalled();
    });

    it('asks to wait out a step that has asked but is not parked yet', async () => {
      mockWorkflowRun({
        stepInfos: {
          [AGENT_STEP_ID]: { status: StepStatus.RUNNING, threadId: THREAD_ID },
        },
      });

      expect(await findStepAwaitingAnswer()).toEqual({
        status: 'NOT_YET_AWAITING',
      });
    });

    it.each([
      [
        'the run is no longer running',
        WorkflowRunStatus.STOPPED,
        { status: StepStatus.PENDING, threadId: THREAD_ID },
      ],
      [
        'the step moved on',
        WorkflowRunStatus.RUNNING,
        { status: StepStatus.SUCCESS, threadId: THREAD_ID },
      ],
      [
        'a retry replaced the conversation',
        WorkflowRunStatus.RUNNING,
        { status: StepStatus.PENDING, error: 'failed' },
      ],
    ])('reports no longer awaiting when %s', async (_, status, stepInfo) => {
      mockWorkflowRun({ status, stepInfos: { [AGENT_STEP_ID]: stepInfo } });

      expect(await findStepAwaitingAnswer()).toEqual({
        status: 'NO_LONGER_AWAITING',
      });
      expect(updateWorkflowRun).not.toHaveBeenCalled();
    });
  });

  describe('updateStepInfoIfPending', () => {
    const claimInConversation = () =>
      service.updateStepInfoIfPending({
        stepId: AGENT_STEP_ID,
        stepInfo: { status: StepStatus.RUNNING },
        expectedThreadId: THREAD_ID,
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });

    it('claims a PENDING step still holding the expected conversation', async () => {
      mockWorkflowRun({
        stepInfos: {
          [AGENT_STEP_ID]: { status: StepStatus.PENDING, threadId: THREAD_ID },
        },
      });

      expect(await claimInConversation()).toBe(true);
      expect(updateWorkflowRun).toHaveBeenCalledWith({
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
        partialUpdate: {
          state: {
            stepInfos: {
              [AGENT_STEP_ID]: {
                status: StepStatus.RUNNING,
                threadId: THREAD_ID,
              },
            },
          },
        },
      });
    });

    it.each([
      [
        'the run is no longer running',
        WorkflowRunStatus.STOPPED,
        { status: StepStatus.PENDING, threadId: THREAD_ID },
      ],
      [
        'the step already resumed',
        WorkflowRunStatus.RUNNING,
        { status: StepStatus.RUNNING, threadId: THREAD_ID },
      ],
      [
        'the step waits on something other than a question',
        WorkflowRunStatus.RUNNING,
        { status: StepStatus.PENDING },
      ],
      [
        'the step holds another conversation',
        WorkflowRunStatus.RUNNING,
        { status: StepStatus.PENDING, threadId: 'other-thread-id' },
      ],
    ])('claims nothing when %s', async (_, status, stepInfo) => {
      mockWorkflowRun({ status, stepInfos: { [AGENT_STEP_ID]: stepInfo } });

      expect(await claimInConversation()).toBe(false);
      expect(updateWorkflowRun).not.toHaveBeenCalled();
    });
  });

  describe('endWorkflowRun', () => {
    it('closes the question a conversation of the run still offers', async () => {
      mockWorkflowRun({
        stepInfos: {
          [AGENT_STEP_ID]: { status: StepStatus.PENDING, threadId: THREAD_ID },
          other: { status: StepStatus.SUCCESS },
        },
      });
      threadRepository.find.mockResolvedValue([
        { id: THREAD_ID, pendingQuestionMessageId: 'question-message-id' },
      ]);
      threadRepository.update.mockResolvedValue({ affected: 1 });
      messagePartRepository.find.mockResolvedValue([
        {
          id: 'part-id',
          toolName: ASK_QUESTIONS_TOOL_NAME,
          toolOutput: { result: { questions: [], status: 'pending' } },
        },
      ]);

      await service.endWorkflowRun({
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
        status: WorkflowRunStatus.STOPPED,
      });

      expect(threadRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: THREAD_ID, pendingQuestionMessageId: 'question-message-id' },
        { pendingQuestionMessageId: null },
      );
      expect(messagePartRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { id: 'part-id' },
        { toolOutput: { result: { questions: [], status: 'skipped' } } },
      );
    });

    it('leaves a question an answer has just claimed to that answer', async () => {
      mockWorkflowRun({
        stepInfos: {
          [AGENT_STEP_ID]: { status: StepStatus.PENDING, threadId: THREAD_ID },
        },
      });
      threadRepository.find.mockResolvedValue([
        { id: THREAD_ID, pendingQuestionMessageId: 'question-message-id' },
      ]);
      threadRepository.update.mockResolvedValue({ affected: 0 });

      await service.endWorkflowRun({
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
        status: WorkflowRunStatus.STOPPED,
      });

      expect(messagePartRepository.update).not.toHaveBeenCalled();
    });

    it('still ends the run when its questions cannot be closed', async () => {
      mockWorkflowRun({
        stepInfos: {
          [AGENT_STEP_ID]: { status: StepStatus.PENDING, threadId: THREAD_ID },
        },
      });
      threadRepository.find.mockRejectedValue(new Error('storage down'));

      await expect(
        service.endWorkflowRun({
          workflowRunId: WORKFLOW_RUN_ID,
          workspaceId: WORKSPACE_ID,
          status: WorkflowRunStatus.STOPPED,
        }),
      ).resolves.toBeUndefined();
      expect(updateWorkflowRun).toHaveBeenCalledTimes(1);
    });
  });
});
