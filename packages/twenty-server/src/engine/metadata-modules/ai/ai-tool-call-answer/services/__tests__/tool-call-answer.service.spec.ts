import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ToolCallAnswerService } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/services/tool-call-answer.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const QUESTION = {
  header: 'Email type',
  question: 'What type of email?',
  options: [{ label: 'Welcome' }, { label: 'Offer' }],
};

const PROPOSAL = {
  toolName: 'create_company',
  toolLabel: 'Create company',
  arguments: { name: 'Acme' },
  summary: 'Create Acme',
  template: 'generic',
};

const buildService = ({ isApproval = false } = {}) => {
  const toolPart = {
    id: 'part-id',
    messageId: 'question-message-id',
    toolName: isApproval ? 'propose_tool_call' : 'ask_question',
    toolInput: isApproval ? PROPOSAL : QUESTION,
    toolOutput: {
      success: true,
      result: {
        status: 'pending',
        ...(isApproval ? { proposal: PROPOSAL } : {}),
      },
    },
  };
  const messageError = new Error('Authored response could not be recorded');
  const agentChatService = {
    addMessage: jest.fn().mockRejectedValue(messageError),
  };
  const recorderService = {
    findAwaitingToolParts: jest.fn().mockResolvedValue([toolPart]),
    recordToolCallAnswer: jest.fn().mockResolvedValue(undefined),
    claimToolCallAnswer: jest.fn().mockResolvedValue(undefined),
  };
  const streamRecoveryService = {
    reapDeadStream: jest.fn().mockResolvedValue(undefined),
    tryClaimStream: jest.fn().mockResolvedValue(true),
    release: jest.fn().mockResolvedValue(undefined),
  };
  const toolRegistryService = {
    resolveAndExecute: jest.fn().mockResolvedValue({
      success: true,
      message: 'Company created',
      result: {},
    }),
  };
  const service = new ToolCallAnswerService(
    {
      findOne: jest.fn().mockResolvedValue({
        id: 'thread-id',
        pendingQuestionMessageId: toolPart.messageId,
      }),
    } as never,
    agentChatService as never,
    recorderService as never,
    { enqueueStreamJob: jest.fn().mockResolvedValue(undefined) } as never,
    streamRecoveryService as never,
    {
      notifyThreadActivityUpdated: jest.fn().mockResolvedValue(undefined),
    } as never,
    {
      authorizeToolCallResolution: jest.fn(),
      resolveRolePermissions: jest.fn().mockResolvedValue({}),
    } as never,
    { publish: jest.fn().mockResolvedValue(undefined) } as never,
    { findAnswerWakeUp: jest.fn().mockResolvedValue(null) } as never,
    {} as never,
    {} as never,
    {
      userHasWorkspaceSettingPermission: jest.fn().mockResolvedValue(true),
    } as never,
    { assertCanStartChatTurn: jest.fn() } as never,
    {
      buildUserAndAgentActorContext: jest.fn().mockResolvedValue({
        actorContext: {},
        userId: 'user-id',
        userContext: { locale: 'en' },
      }),
    } as never,
    toolRegistryService as never,
    { findToolPart: jest.fn().mockResolvedValue(toolPart) } as never,
    {} as never,
  );

  return {
    service,
    agentChatService,
    recorderService,
    messageError,
    toolRegistryService,
  };
};

const ANSWER_ARGUMENTS = {
  threadId: 'thread-id',
  toolCallId: 'tool-call-id',
  response: { selectedOptionIndices: [0] },
  userWorkspaceId: 'user-workspace-id',
  workspaceMemberId: 'answering-member-id',
  workspace: { id: 'workspace-id' } as never,
};

describe('ToolCallAnswerService mention resolution', () => {
  it('does not record invalid answers', async () => {
    const { service, recorderService } = buildService();

    await expect(
      service.answer({
        ...ANSWER_ARGUMENTS,
        response: { selectedOptionIndices: [] },
      }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.INVALID_TOOL_CALL_OUTPUT,
    });

    expect(recorderService.recordToolCallAnswer).not.toHaveBeenCalled();
  });

  it('records the answering member before a later authored response failure', async () => {
    const { service, recorderService, agentChatService, messageError } =
      buildService();

    await expect(service.answer(ANSWER_ARGUMENTS)).rejects.toThrow(
      messageError,
    );

    expect(recorderService.recordToolCallAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: 'thread-id',
        workspaceId: 'workspace-id',
        workspaceMemberId: 'answering-member-id',
        toolOutput: expect.objectContaining({
          result: expect.objectContaining({ status: 'answered' }),
        }),
      }),
    );
    expect(agentChatService.addMessage).toHaveBeenCalledWith(
      expect.objectContaining({ shouldResolveMention: false }),
    );
    expect(
      recorderService.recordToolCallAnswer.mock.invocationCallOrder[0],
    ).toBeLessThan(agentChatService.addMessage.mock.invocationCallOrder[0]);
  });

  it('does not create an authored response when the accepted answer cannot be recorded', async () => {
    const { service, recorderService, agentChatService } = buildService();
    const persistenceError = new Error('Answer could not be recorded');

    recorderService.recordToolCallAnswer.mockRejectedValueOnce(
      persistenceError,
    );

    await expect(service.answer(ANSWER_ARGUMENTS)).rejects.toThrow(
      persistenceError,
    );

    expect(agentChatService.addMessage).not.toHaveBeenCalled();
  });
});

const answerApproval = (service: ToolCallAnswerService) =>
  workspaceAuthContextStorage.run({ type: 'user' } as never, () =>
    service.answer({ ...ANSWER_ARGUMENTS, response: { decision: 'approve' } }),
  );

describe('ToolCallAnswerService approval acceptance', () => {
  it('accepts an approval before executing its tool and skips resolving again on completion', async () => {
    const { service, recorderService, agentChatService, toolRegistryService } =
      buildService({ isApproval: true });

    agentChatService.addMessage.mockResolvedValueOnce({
      id: 'answer-message',
      turnId: 'answer-turn',
    });

    await answerApproval(service);

    expect(recorderService.claimToolCallAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: 'thread-id',
        workspaceMemberId: 'answering-member-id',
        toolOutput: expect.objectContaining({
          result: expect.objectContaining({ status: 'running' }),
        }),
      }),
    );
    expect(
      recorderService.claimToolCallAnswer.mock.invocationCallOrder[0],
    ).toBeLessThan(
      toolRegistryService.resolveAndExecute.mock.invocationCallOrder[0],
    );
    expect(recorderService.recordToolCallAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ shouldResolveMention: false }),
    );
  });

  it('preserves accepted resolution when tool execution fails', async () => {
    const { service, recorderService, agentChatService, toolRegistryService } =
      buildService({ isApproval: true });

    agentChatService.addMessage.mockResolvedValueOnce({
      id: 'answer-message',
      turnId: 'answer-turn',
    });
    toolRegistryService.resolveAndExecute.mockRejectedValueOnce(
      new Error('Tool execution failed'),
    );

    await answerApproval(service);

    expect(recorderService.claimToolCallAnswer).toHaveBeenCalledTimes(1);
    expect(recorderService.recordToolCallAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldResolveMention: false,
        toolOutput: expect.objectContaining({
          result: expect.objectContaining({ status: 'failed' }),
        }),
      }),
    );
  });

  it('does not execute an approval whose pending claim was rejected', async () => {
    const { service, recorderService, toolRegistryService } = buildService({
      isApproval: true,
    });
    const claimError = new Error('Approval is no longer pending');

    recorderService.claimToolCallAnswer.mockRejectedValueOnce(claimError);

    await expect(answerApproval(service)).rejects.toThrow(claimError);

    expect(toolRegistryService.resolveAndExecute).not.toHaveBeenCalled();
    expect(recorderService.recordToolCallAnswer).not.toHaveBeenCalled();
  });
});
