import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';
import { StepStatus } from 'twenty-shared/workflow';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentRunThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-run-thread.service';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const RUN_ID = 'run-id';
const STEP_ID = 'step-id';
const OWNER_ID = 'owner-user-workspace-id';

const QUESTIONS = [
  {
    header: 'Send outreach',
    question: 'Send the email now?',
    options: [{ label: 'Send it' }, { label: 'Hold' }],
  },
];

const buildThread = () => ({
  id: THREAD_ID,
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: OWNER_ID,
  workflowRunId: RUN_ID,
  workflowStepId: STEP_ID,
  totalInputTokens: 10,
  totalOutputTokens: 5,
});

const buildService = () => {
  const threadRepository = {
    findOne: jest.fn().mockResolvedValue(buildThread()),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const messageRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({
      id: 'question-message-id',
      parts: [
        {
          toolName: ASK_QUESTIONS_TOOL_NAME,
          toolOutput: { result: { questions: QUESTIONS, status: 'pending' } },
        },
      ],
    }),
  };
  const agentChatService = {
    createThread: jest.fn().mockResolvedValue(buildThread()),
    addMessage: jest.fn().mockImplementation(({ uiMessage }) =>
      Promise.resolve({
        id: `${uiMessage.role}-message-id`,
        turnId: 'turn-id',
      }),
    ),
    broadcastThreadChanged: jest.fn().mockResolvedValue(undefined),
    resolvePendingQuestion: jest.fn().mockResolvedValue({
      turnId: 'turn-id',
      rollback: { partId: 'part-id', previousOutput: {} },
    }),
    restorePendingQuestion: jest.fn().mockResolvedValue(undefined),
    deleteMessage: jest.fn().mockResolvedValue(undefined),
  };
  const eventPublisherService = {
    publish: jest.fn().mockResolvedValue(undefined),
  };
  const workflowRunWorkspaceService = {
    updateWorkflowRunStepInfo: jest.fn().mockResolvedValue(undefined),
    getWorkflowRun: jest
      .fn()
      .mockResolvedValue({ id: 'workflow-run-id', status: 'RUNNING' }),
  };
  const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
  const streamHeartbeatService = {
    markClaimed: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  };

  const service = new AgentRunThreadService(
    threadRepository as never,
    messageRepository as never,
    { findOne: jest.fn().mockResolvedValue({ id: 'admin-role' }) } as never,
    {
      findOne: jest.fn().mockResolvedValue({ userWorkspaceId: 'admin-uw' }),
    } as never,
    { findOne: jest.fn().mockResolvedValue(null) } as never,
    agentChatService as never,
    eventPublisherService as never,
    streamHeartbeatService as never,
    { executeInWorkspaceContext: jest.fn() } as never,
    workflowRunWorkspaceService as never,
    messageQueueService as never,
  );

  return {
    service,
    threadRepository,
    messageRepository,
    streamHeartbeatService,
    agentChatService,
    eventPublisherService,
    workflowRunWorkspaceService,
    messageQueueService,
  };
};

describe('AgentRunThreadService', () => {
  it('records what the agent did and leaves the thread waiting on the question it asked', async () => {
    const { service, agentChatService, threadRepository } = buildService();

    const { pendingQuestions } = await service.recordAssistantTurn({
      thread: buildThread() as never,
      agentId: null,
      executionResult: {
        result: { response: '' },
        usage: { inputTokens: 100, outputTokens: 20 },
        cacheCreationTokens: 0,
        nativeWebSearchCallCount: 0,
        hasNoMoreAvailableCredits: false,
        pausedOnToolName: ASK_QUESTIONS_TOOL_NAME,
        steps: [
          {
            text: 'The lead fits. Draft ready.',
            toolCalls: [
              {
                toolCallId: 'call-1',
                toolName: ASK_QUESTIONS_TOOL_NAME,
                input: { questions: QUESTIONS },
              },
            ],
            toolResults: [
              {
                toolCallId: 'call-1',
                toolName: ASK_QUESTIONS_TOOL_NAME,
                output: { result: { questions: QUESTIONS, status: 'pending' } },
              },
            ],
          },
        ],
      } as never,
    });

    expect(pendingQuestions).toEqual(QUESTIONS);
    expect(agentChatService.addMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        uiMessage: {
          role: 'assistant',
          parts: [
            { type: 'text', text: 'The lead fits. Draft ready.' },
            expect.objectContaining({
              type: `tool-${ASK_QUESTIONS_TOOL_NAME}`,
              toolCallId: 'call-1',
              state: 'output-available',
            }),
          ],
        },
      }),
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      WORKSPACE_ID,
      { id: THREAD_ID },
      expect.objectContaining({
        pendingQuestionMessageId: 'assistant-message-id',
        totalInputTokens: 110,
        totalOutputTokens: 25,
      }),
    );
  });

  it('clears the waiting state when the agent finished without asking', async () => {
    const { service, threadRepository } = buildService();

    const { pendingQuestions } = await service.recordAssistantTurn({
      thread: buildThread() as never,
      agentId: null,
      executionResult: {
        result: { response: 'Done.' },
        usage: { inputTokens: 1, outputTokens: 1 },
        cacheCreationTokens: 0,
        nativeWebSearchCallCount: 0,
        hasNoMoreAvailableCredits: false,
        steps: [{ text: 'Done.', toolCalls: [], toolResults: [] }],
      } as never,
    });

    expect(pendingQuestions).toBeNull();
    expect(threadRepository.update).toHaveBeenCalledWith(
      WORKSPACE_ID,
      { id: THREAD_ID },
      expect.objectContaining({ pendingQuestionMessageId: null }),
    );
  });

  it('keeps the claim until the answer is written, so a second answer cannot adopt the question', async () => {
    const { service, agentChatService, threadRepository } = buildService();
    const callOrder: string[] = [];

    agentChatService.addMessage.mockImplementation(async () => {
      callOrder.push('addMessage');

      return { id: 'answer-message-id' };
    });
    threadRepository.update.mockImplementation(async (...args: unknown[]) => {
      const values = args[2] as { activeStreamId?: string | null };

      if (values?.activeStreamId === null) {
        callOrder.push('releaseClaim');
      }

      return { affected: 1 };
    });

    await service.answerRunQuestion({
      thread: buildThread() as never,
      messageId: 'question-message-id',
      answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
      userWorkspaceId: OWNER_ID,
    });

    expect(callOrder).toEqual(['addMessage', 'releaseClaim']);
  });

  it('registers liveness for the answer claim, so the stream reaper cannot clear it', async () => {
    const { service, streamHeartbeatService, threadRepository } =
      buildService();

    await service.answerRunQuestion({
      thread: buildThread() as never,
      messageId: 'question-message-id',
      answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
      userWorkspaceId: OWNER_ID,
    });

    const [claimStreamId] = streamHeartbeatService.markClaimed.mock.calls[0];

    expect(claimStreamId).toMatch(/^workflow-run-answer:/);
    expect(
      streamHeartbeatService.markClaimed.mock.invocationCallOrder[0],
    ).toBeLessThan(threadRepository.update.mock.invocationCallOrder[0]);
    expect(streamHeartbeatService.clear).toHaveBeenCalledWith(claimStreamId);
  });

  it('clears the answer claim liveness when the run cannot be re-queued', async () => {
    const { service, streamHeartbeatService, messageQueueService } =
      buildService();

    messageQueueService.add.mockRejectedValue(new Error('queue down'));

    await expect(
      service.answerRunQuestion({
        thread: buildThread() as never,
        messageId: 'question-message-id',
        answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
        userWorkspaceId: OWNER_ID,
      }),
    ).rejects.toThrow('queue down');

    const [claimStreamId] = streamHeartbeatService.markClaimed.mock.calls[0];

    expect(streamHeartbeatService.clear).toHaveBeenCalledWith(claimStreamId);
  });

  it('appends this execution own prompt when the conversation ended on an assistant turn', async () => {
    const { service, messageRepository, agentChatService } = buildService();

    messageRepository.findOne.mockResolvedValue({
      id: 'assistant-message-id',
      role: AgentMessageRole.ASSISTANT,
    });

    await service.appendRunPromptForNewExecution({
      thread: buildThread() as never,
      prompt: 'Qualify Globex',
      agentId: null,
    });

    expect(agentChatService.addMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: THREAD_ID,
        uiMessage: {
          role: 'user',
          parts: [{ type: 'text', text: 'Qualify Globex' }],
        },
      }),
    );
  });

  it('appends nothing when the conversation is resuming on somebody answer', async () => {
    const { service, messageRepository, agentChatService } = buildService();

    messageRepository.findOne.mockResolvedValue({
      id: 'answer-message-id',
      role: AgentMessageRole.USER,
    });

    await service.appendRunPromptForNewExecution({
      thread: buildThread() as never,
      prompt: 'Qualify Globex',
      agentId: null,
    });

    expect(agentChatService.addMessage).not.toHaveBeenCalled();
  });

  it('puts the question back when writing the answer fails, so the run is not left half-answered', async () => {
    const { service, agentChatService, messageQueueService } = buildService();

    agentChatService.addMessage.mockRejectedValue(new Error('write failed'));

    await expect(
      service.answerRunQuestion({
        thread: buildThread() as never,
        messageId: 'question-message-id',
        answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
        userWorkspaceId: OWNER_ID,
      }),
    ).rejects.toThrow('write failed');

    expect(agentChatService.restorePendingQuestion).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: THREAD_ID,
        messageId: 'question-message-id',
        workspaceId: WORKSPACE_ID,
        rollback: { partId: 'part-id', previousOutput: {} },
      }),
    );
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('puts the question back when the run cannot be re-queued', async () => {
    const { service, agentChatService, messageQueueService } = buildService();

    messageQueueService.add.mockRejectedValue(new Error('queue is down'));

    await expect(
      service.answerRunQuestion({
        thread: buildThread() as never,
        messageId: 'question-message-id',
        answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
        userWorkspaceId: OWNER_ID,
      }),
    ).rejects.toThrow('queue is down');

    expect(agentChatService.restorePendingQuestion).toHaveBeenCalled();
  });

  // The answer goes back with the question: leaving it would read as answered
  // while the question is pending again, and the next attempt would post it
  // a second time.
  it('takes the answer back out when the run cannot be re-queued', async () => {
    const { service, agentChatService, messageQueueService } = buildService();

    messageQueueService.add.mockRejectedValue(new Error('queue is down'));

    await expect(
      service.answerRunQuestion({
        thread: buildThread() as never,
        messageId: 'question-message-id',
        answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
        userWorkspaceId: OWNER_ID,
      }),
    ).rejects.toThrow('queue is down');

    expect(agentChatService.deleteMessage).toHaveBeenCalledWith({
      messageId: 'user-message-id',
      workspaceId: WORKSPACE_ID,
    });
  });

  it('keeps the original error when taking the answer back out also fails', async () => {
    const { service, agentChatService, messageQueueService } = buildService();

    messageQueueService.add.mockRejectedValue(new Error('queue is down'));
    agentChatService.deleteMessage.mockRejectedValue(
      new Error('delete failed'),
    );

    await expect(
      service.answerRunQuestion({
        thread: buildThread() as never,
        messageId: 'question-message-id',
        answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
        userWorkspaceId: OWNER_ID,
      }),
    ).rejects.toThrow('queue is down');
  });

  it('has no answer to take back out when writing it is what failed', async () => {
    const { service, agentChatService } = buildService();

    agentChatService.addMessage.mockRejectedValue(new Error('write failed'));

    await expect(
      service.answerRunQuestion({
        thread: buildThread() as never,
        messageId: 'question-message-id',
        answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
        userWorkspaceId: OWNER_ID,
      }),
    ).rejects.toThrow('write failed');

    expect(agentChatService.deleteMessage).not.toHaveBeenCalled();
  });

  it('refuses an answer once the run is no longer waiting for one', async () => {
    const { service, agentChatService, workflowRunWorkspaceService } =
      buildService();

    workflowRunWorkspaceService.getWorkflowRun.mockResolvedValue({
      id: 'workflow-run-id',
      status: 'COMPLETED',
    });

    await expect(
      service.answerRunQuestion({
        thread: buildThread() as never,
        messageId: 'question-message-id',
        answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
        userWorkspaceId: OWNER_ID,
      }),
    ).rejects.toThrow('no longer waiting for an answer');

    expect(agentChatService.resolvePendingQuestion).not.toHaveBeenCalled();
  });

  it('answers the question, records the answer and re-queues the step', async () => {
    const {
      service,
      agentChatService,
      threadRepository,
      workflowRunWorkspaceService,
      messageQueueService,
      eventPublisherService,
    } = buildService();

    await service.answerRunQuestion({
      thread: buildThread() as never,
      messageId: 'question-message-id',
      answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
      userWorkspaceId: OWNER_ID,
    });

    expect(agentChatService.resolvePendingQuestion).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: THREAD_ID,
        messageId: 'question-message-id',
      }),
    );
    expect(threadRepository.update).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ id: THREAD_ID }),
      { activeStreamId: null },
    );
    expect(agentChatService.addMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        uiMessage: {
          role: 'user',
          parts: [{ type: 'text', text: 'Send outreach: Send it' }],
        },
        authorUserWorkspaceId: OWNER_ID,
      }),
    );
    expect(eventPublisherService.publish).toHaveBeenCalledWith(
      expect.objectContaining({ event: { type: 'question-answered' } }),
    );
    expect(
      workflowRunWorkspaceService.updateWorkflowRunStepInfo,
    ).toHaveBeenCalledWith({
      stepId: STEP_ID,
      stepInfo: { status: StepStatus.NOT_STARTED },
      workflowRunId: RUN_ID,
      workspaceId: WORKSPACE_ID,
    });
    expect(messageQueueService.add).toHaveBeenCalledWith(
      RUN_WORKFLOW_JOB_NAME,
      {
        workspaceId: WORKSPACE_ID,
        workflowRunId: RUN_ID,
        stepIdsToRetry: [STEP_ID],
      },
      expect.objectContaining({ id: RUN_ID }),
    );
  });

  it('rebuilds the conversation as text for the resumed agent', async () => {
    const { service, messageRepository } = buildService();

    messageRepository.find.mockResolvedValueOnce([
      {
        role: AgentMessageRole.USER,
        parts: [
          { orderIndex: 0, type: 'text', textContent: 'Qualify this lead.' },
        ],
      },
      {
        role: AgentMessageRole.ASSISTANT,
        parts: [
          {
            orderIndex: 1,
            type: 'tool-ask_questions',
            toolName: ASK_QUESTIONS_TOOL_NAME,
            toolOutput: {
              result: {
                questions: QUESTIONS,
                status: 'answered',
                answers: [{ questionIndex: 0, selectedOptionIndices: [1] }],
              },
            },
          },
          { orderIndex: 0, type: 'text', textContent: 'Draft ready.' },
        ],
      },
    ]);

    const transcript = await service.loadTranscript({
      threadId: THREAD_ID,
      workspaceId: WORKSPACE_ID,
    });

    expect(transcript).toEqual([
      { role: 'user', content: 'Qualify this lead.' },
      {
        role: 'assistant',
        content:
          'Draft ready.\nAsked: Send the email now? (options: Send it, Hold)\nAnswered: Send outreach: Hold',
      },
    ]);
  });
});
