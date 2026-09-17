import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';

import { AiAgentWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/ai-agent.workflow-action';

const WORKSPACE_ID = 'workspace-id';
const RUN_ID = 'run-id';
const STEP_ID = 'step-id';
const THREAD_ID = 'thread-id';

const STEP = {
  id: STEP_ID,
  name: 'Qualify the lead',
  type: 'AI_AGENT',
  valid: true,
  settings: {
    input: { prompt: 'Qualify {{trigger.name}}' },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
};

const buildAction = ({
  existingThread = null,
  pendingQuestions = null,
}: {
  existingThread?: { id: string } | null;
  pendingQuestions?: object[] | null;
} = {}) => {
  const executionResult = {
    result: { response: 'Warm lead.' },
    usage: { inputTokens: 1, outputTokens: 1 },
    cacheCreationTokens: 0,
    nativeWebSearchCallCount: 0,
    hasNoMoreAvailableCredits: false,
    steps: [],
    modelId: 'model',
  };
  const aiAgentExecutionService = {
    executeAgent: jest.fn().mockResolvedValue(executionResult),
  };
  const workflowExecutionContextService = {
    getExecutionContext: jest.fn().mockResolvedValue({
      isActingOnBehalfOfUser: true,
      initiator: { workspaceMemberId: 'member-id' },
      authContext: { type: 'user', userWorkspaceId: 'user-workspace-id' },
    }),
  };
  const workflowRunStepLogService = { setStepLog: jest.fn() };
  const agentRepository = { findOne: jest.fn() };
  const workflowRunWorkspaceService = {
    getWorkflowRun: jest
      .fn()
      .mockResolvedValue({ name: '#3 - Lead qualification' }),
  };
  const agentRunThreadService = {
    findRunThread: jest.fn().mockResolvedValue(existingThread),
    resolveOwnerUserWorkspaceId: jest
      .fn()
      .mockResolvedValue('user-workspace-id'),
    openRunThread: jest.fn().mockResolvedValue({ id: THREAD_ID }),
    loadTranscript: jest
      .fn()
      .mockResolvedValue([{ role: 'user', content: 'Qualify Acme' }]),
    recordAssistantTurn: jest.fn().mockResolvedValue({
      messageId: 'assistant-message-id',
      pendingQuestions,
    }),
  };

  const action = new AiAgentWorkflowAction(
    aiAgentExecutionService as never,
    workflowExecutionContextService as never,
    workflowRunStepLogService as never,
    agentRepository as never,
    workflowRunWorkspaceService as never,
    { get: () => agentRunThreadService } as never,
  );

  const execute = () =>
    action.execute({
      currentStepId: STEP_ID,
      steps: [STEP] as never,
      context: { trigger: { name: 'Acme' } },
      runInfo: { workflowRunId: RUN_ID, workspaceId: WORKSPACE_ID },
    } as never);

  return { execute, aiAgentExecutionService, agentRunThreadService };
};

describe('AiAgentWorkflowAction', () => {
  it('opens the run conversation with the resolved prompt and answers from it', async () => {
    const { execute, agentRunThreadService, aiAgentExecutionService } =
      buildAction();

    await expect(execute()).resolves.toEqual({
      result: { response: 'Warm lead.' },
    });

    expect(agentRunThreadService.openRunThread).toHaveBeenCalledWith(
      expect.objectContaining({
        workflowRunId: RUN_ID,
        workflowStepId: STEP_ID,
        ownerUserWorkspaceId: 'user-workspace-id',
        title: '#3 - Lead qualification · Qualify the lead',
        prompt: 'Qualify Acme',
      }),
    );
    expect(aiAgentExecutionService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: 'user', content: 'Qualify Acme' }],
        pauseOnToolNames: [ASK_QUESTIONS_TOOL_NAME],
        extraTools: expect.objectContaining({
          [ASK_QUESTIONS_TOOL_NAME]: expect.anything(),
        }),
      }),
    );
    expect(agentRunThreadService.recordAssistantTurn).toHaveBeenCalledWith(
      expect.objectContaining({ thread: { id: THREAD_ID } }),
    );
  });

  it('pauses the run when the agent asked a question', async () => {
    const { execute } = buildAction({
      pendingQuestions: [{ header: 'Send', question: 'Send it?' }],
    });

    await expect(execute()).resolves.toEqual({ pendingEvent: true });
  });

  it('continues an existing conversation instead of opening a new one', async () => {
    const { execute, agentRunThreadService } = buildAction({
      existingThread: { id: THREAD_ID },
    });

    await execute();

    expect(agentRunThreadService.openRunThread).not.toHaveBeenCalled();
    expect(agentRunThreadService.loadTranscript).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      workspaceId: WORKSPACE_ID,
    });
  });
});
