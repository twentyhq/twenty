import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ToolCallResolutionService } from 'src/engine/metadata-modules/ai/ai-tool-call-resolution/services/tool-call-resolution.service';
import { InputAskStatus } from 'src/modules/input-ask/enums/input-ask-status.enum';

const QUESTIONS = [
  {
    header: 'Plan',
    question: 'Which plan?',
    options: [{ label: 'Pro' }, { label: 'Team' }],
  },
];

const ANSWERS = [{ questionIndex: 0, selectedOptionIndices: [1] }];

describe('ToolCallResolutionService', () => {
  const workspace = { id: 'workspace-id' } as WorkspaceEntity;

  const resolveArguments = {
    threadId: 'thread-id',
    toolCallId: 'tool-call-id',
    output: { answers: ANSWERS },
    userWorkspaceId: 'user-workspace-id',
    workspaceMemberId: 'member-id',
    workspace,
  };

  const buildService = ({
    inputAsk = {
      id: 'input-ask-id',
      status: InputAskStatus.PENDING,
      workflowRunId: null as string | null,
    },
    hasClaimedStream = true,
    hasAnswered = true,
    hasPermission = true,
  } = {}) => {
    const publishedEvents: Array<{ type: string }> = [];
    const agentChatService = {
      findToolPart: jest.fn().mockResolvedValue({
        id: 'part-id',
        messageId: 'question-message-id',
        turnId: 'question-turn-id',
        toolName: 'ask_questions',
        toolInput: { questions: QUESTIONS },
        toolOutput: { result: { questions: QUESTIONS, status: 'pending' } },
      }),
      getWritableThread: jest
        .fn()
        .mockResolvedValue({ id: 'thread-id', activeStreamId: null }),
      updateToolPartOutput: jest.fn().mockResolvedValue(undefined),
      addMessage: jest
        .fn()
        .mockResolvedValue({ id: 'answer-message-id', turnId: 'answer-turn' }),
    };
    const agentChatStreamingService = {
      reapDeadStream: jest.fn().mockResolvedValue(null),
      tryClaimStream: jest.fn().mockResolvedValue(hasClaimedStream),
      releaseStreamClaim: jest.fn().mockResolvedValue(undefined),
      enqueueResumeStream: jest.fn().mockResolvedValue(undefined),
    };
    const actorService = {
      authorizeToolCallResolution: jest.fn().mockResolvedValue(undefined),
    };
    const eventPublisherService = {
      publish: jest.fn().mockImplementation(({ event }) => {
        publishedEvents.push(event);

        return Promise.resolve();
      }),
    };
    const inputAskWorkspaceService = {
      findReadableForToolCall: jest.fn().mockResolvedValue(inputAsk),
      answer: jest.fn().mockResolvedValue(hasAnswered),
    };
    const workflowRunnerWorkspaceService = {
      resolveAgentStepToolCall: jest
        .fn()
        .mockResolvedValue({ status: 'RESOLVED', stepId: 'step-id' }),
    };
    const permissionsService = {
      userHasWorkspaceSettingPermission: jest
        .fn()
        .mockResolvedValue(hasPermission),
    };
    const aiModelRegistryService = {
      getAvailableModels: jest.fn().mockReturnValue([{ modelId: 'model' }]),
      validateModelAvailability: jest.fn(),
    };
    const aiBillingService = {
      assertAiExecutionAllowed: jest.fn().mockResolvedValue(undefined),
    };
    const workflowRunRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 'workflow-run-id' }),
    };
    const workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn().mockImplementation((work) => work()),
      getRepositoryWithContextPermissions: jest
        .fn()
        .mockReturnValue(workflowRunRepository),
    };

    const service = new ToolCallResolutionService(
      agentChatService as never,
      agentChatStreamingService as never,
      actorService as never,
      eventPublisherService as never,
      inputAskWorkspaceService as never,
      workflowRunnerWorkspaceService as never,
      permissionsService as never,
      aiModelRegistryService as never,
      aiBillingService as never,
      workspaceOrmManager as never,
    );

    return {
      service,
      agentChatService,
      agentChatStreamingService,
      actorService,
      inputAskWorkspaceService,
      workflowRunnerWorkspaceService,
      permissionsService,
      workflowRunRepository,
      publishedEvents,
    };
  };

  describe('in a chat', () => {
    it('answers the Ask once, records the answer and resumes the stream', async () => {
      const {
        service,
        agentChatService,
        agentChatStreamingService,
        inputAskWorkspaceService,
        publishedEvents,
      } = buildService();

      const result = await service.resolve(resolveArguments);

      expect(result).toEqual({
        streamId: expect.any(String),
        turnId: 'answer-turn',
      });
      expect(inputAskWorkspaceService.answer).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        key: { threadId: 'thread-id', toolCallId: 'tool-call-id' },
        response: { answers: ANSWERS },
      });
      expect(agentChatService.updateToolPartOutput).toHaveBeenCalledWith({
        partId: 'part-id',
        workspaceId: 'workspace-id',
        toolOutput: expect.objectContaining({
          result: {
            questions: QUESTIONS,
            status: 'answered',
            answers: ANSWERS,
          },
        }),
      });
      expect(agentChatService.addMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          userWorkspaceId: 'user-workspace-id',
          uiMessage: {
            role: 'user',
            parts: [{ type: 'text', text: 'Which plan?\nTeam' }],
          },
        }),
      );
      expect(agentChatStreamingService.enqueueResumeStream).toHaveBeenCalledWith(
        expect.objectContaining({
          streamId: result.streamId,
          messageId: 'answer-message-id',
          turnId: 'answer-turn',
        }),
      );
      expect(publishedEvents).toContainEqual({
        type: 'tool-call-resolved',
        toolCallId: 'tool-call-id',
      });
    });

    it('refuses an Ask that is no longer pending before touching the conversation', async () => {
      const { service, agentChatStreamingService, agentChatService } =
        buildService({
          inputAsk: {
            id: 'input-ask-id',
            status: InputAskStatus.ANSWERED,
            workflowRunId: null,
          },
        });

      await expect(service.resolve(resolveArguments)).rejects.toMatchObject({
        code: 'TOOL_CALL_NOT_PENDING',
      });
      expect(agentChatStreamingService.tryClaimStream).not.toHaveBeenCalled();
      expect(agentChatService.addMessage).not.toHaveBeenCalled();
    });

    it('treats an Ask the caller cannot read as not found', async () => {
      const { service } = buildService({ inputAsk: null as never });

      await expect(service.resolve(resolveArguments)).rejects.toMatchObject({
        code: 'TOOL_CALL_NOT_FOUND',
      });
    });

    it.each([
      { answers: [] },
      {
        answers: [
          { questionIndex: 0, selectedOptionIndices: [], freeText: '  ' },
        ],
      },
      { answers: [{ questionIndex: 3, selectedOptionIndices: [0] }] },
      { answers: [{ questionIndex: 0, selectedOptionIndices: [0, 1] }] },
    ])('rejects an output the call cannot accept (%j)', async (output) => {
      const { service, inputAskWorkspaceService } = buildService();

      await expect(
        service.resolve({ ...resolveArguments, output }),
      ).rejects.toMatchObject({ code: 'INVALID_TOOL_CALL_OUTPUT' });
      expect(inputAskWorkspaceService.answer).not.toHaveBeenCalled();
    });

    it('refuses a resolver without the AI permission', async () => {
      const { service, inputAskWorkspaceService } = buildService({
        hasPermission: false,
      });

      await expect(service.resolve(resolveArguments)).rejects.toMatchObject({
        code: 'TOOL_CALL_RESOLUTION_FORBIDDEN',
      });
      expect(inputAskWorkspaceService.answer).not.toHaveBeenCalled();
    });

    it('refuses while another response holds the stream, without answering', async () => {
      const { service, inputAskWorkspaceService } = buildService({
        hasClaimedStream: false,
      });

      await expect(service.resolve(resolveArguments)).rejects.toMatchObject({
        code: 'TOOL_CALL_NOT_PENDING',
      });
      expect(inputAskWorkspaceService.answer).not.toHaveBeenCalled();
    });

    it('releases the stream it claimed when another answer won the Ask', async () => {
      const { service, agentChatStreamingService, agentChatService } =
        buildService({ hasAnswered: false });

      await expect(service.resolve(resolveArguments)).rejects.toMatchObject({
        code: 'TOOL_CALL_NOT_PENDING',
      });

      const [[, , claimedStreamId]] =
        agentChatStreamingService.tryClaimStream.mock.calls.map(
          ([{ threadId, workspaceId, streamId }]) => [
            threadId,
            workspaceId,
            streamId,
          ],
        );

      expect(agentChatStreamingService.releaseStreamClaim).toHaveBeenCalledWith(
        'thread-id',
        'workspace-id',
        claimedStreamId,
      );
      expect(agentChatService.updateToolPartOutput).not.toHaveBeenCalled();
      expect(agentChatService.addMessage).not.toHaveBeenCalled();
    });

    it('leaves a retryable failed turn when the resume cannot be scheduled', async () => {
      const { service, agentChatStreamingService, publishedEvents } =
        buildService();

      agentChatStreamingService.enqueueResumeStream.mockRejectedValue(
        new Error('redis down'),
      );

      await expect(service.resolve(resolveArguments)).rejects.toThrow(
        'redis down',
      );
      expect(agentChatStreamingService.releaseStreamClaim).toHaveBeenCalledWith(
        'thread-id',
        'workspace-id',
        expect.any(String),
        {
          lastStreamError: expect.objectContaining({
            message: 'redis down',
            failedAt: expect.any(String),
          }),
        },
      );
      expect(publishedEvents.map((event) => event.type)).toContain(
        'stream-error',
      );
      expect(publishedEvents.map((event) => event.type)).not.toContain(
        'tool-call-resolved',
      );
    });
  });

  describe('in a workflow run', () => {
    const runInputAsk = {
      id: 'input-ask-id',
      status: InputAskStatus.PENDING,
      workflowRunId: 'workflow-run-id',
    };

    it('hands the answer to the run, with no chat stream', async () => {
      const {
        service,
        workflowRunnerWorkspaceService,
        agentChatStreamingService,
        permissionsService,
        publishedEvents,
      } = buildService({ inputAsk: runInputAsk });

      expect(await service.resolve(resolveArguments)).toEqual({
        streamId: null,
        turnId: null,
      });
      expect(
        permissionsService.userHasWorkspaceSettingPermission,
      ).toHaveBeenCalledWith(expect.objectContaining({ setting: 'WORKFLOWS' }));
      expect(
        workflowRunnerWorkspaceService.resolveAgentStepToolCall,
      ).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        workflowRunId: 'workflow-run-id',
        threadId: 'thread-id',
        toolCallId: 'tool-call-id',
        response: { answers: ANSWERS },
        toolResult: expect.objectContaining({
          result: expect.objectContaining({ status: 'answered' }),
        }),
        answerText: 'Which plan?\nTeam',
        senderUserWorkspaceId: 'user-workspace-id',
      });
      expect(agentChatStreamingService.tryClaimStream).not.toHaveBeenCalled();
      expect(publishedEvents).toContainEqual({
        type: 'tool-call-resolved',
        toolCallId: 'tool-call-id',
      });
    });

    it('refuses an answer the run no longer waits for', async () => {
      const { service, workflowRunnerWorkspaceService } = buildService({
        inputAsk: runInputAsk,
      });

      workflowRunnerWorkspaceService.resolveAgentStepToolCall.mockResolvedValue(
        { status: 'NOT_AWAITING' },
      );

      await expect(service.resolve(resolveArguments)).rejects.toMatchObject({
        code: 'TOOL_CALL_NOT_PENDING',
      });
    });

    it('treats a run the caller cannot read as not found', async () => {
      const { service, workflowRunRepository, workflowRunnerWorkspaceService } =
        buildService({ inputAsk: runInputAsk });

      workflowRunRepository.findOne.mockResolvedValue(null);

      await expect(service.resolve(resolveArguments)).rejects.toMatchObject({
        code: 'TOOL_CALL_NOT_FOUND',
      });
      expect(
        workflowRunnerWorkspaceService.resolveAgentStepToolCall,
      ).not.toHaveBeenCalled();
    });
  });
});
