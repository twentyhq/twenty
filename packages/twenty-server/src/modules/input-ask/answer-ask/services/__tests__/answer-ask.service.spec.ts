import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatTurnPreflightService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-preflight.service';
import { AnswerAskService } from 'src/modules/input-ask/answer-ask/services/answer-ask.service';
import { InputAskStatus } from 'src/modules/input-ask/enums/input-ask-status.enum';

const QUESTIONS = [
  {
    header: 'Plan',
    question: 'Which plan?',
    options: [{ label: 'Pro' }, { label: 'Team' }],
  },
];

const ANSWERS = [{ questionIndex: 0, selectedOptionIndices: [1] }];

const PROPOSED_EMAIL = {
  recipients: { to: 'tim@apple.dev', cc: '', bcc: '' },
  subject: 'Renewal',
  body: 'Hi Tim,\n\nYour plan renews next week.',
};

type BuildOptions = {
  inputAsk?: Record<string, unknown> | null;
  toolPart?: Record<string, unknown> | null;
  hasClaimedStream?: boolean;
  hasAnswered?: boolean;
  hasPermission?: boolean;
  hasSubmittedForm?: boolean;
  hasOtherPendingAsks?: boolean;
};

const chatInputAsk = {
  id: 'ask-id',
  status: InputAskStatus.PENDING,
  form: { kind: 'questions', questions: QUESTIONS },
  threadId: 'thread-id',
  toolCallId: 'tool-call-id',
  workflowRunId: null,
  stepId: null,
};

const questionPart = {
  id: 'part-id',
  messageId: 'question-message-id',
  turnId: 'question-turn-id',
  toolName: 'ask_questions',
  toolInput: { questions: QUESTIONS },
  toolOutput: { result: { questions: QUESTIONS, status: 'pending' } },
};

describe('AnswerAskService', () => {
  const workspace = { id: 'workspace-id' } as WorkspaceEntity;

  const answerArguments = {
    askId: 'ask-id',
    response: { answers: ANSWERS } as Record<string, unknown>,
    userWorkspaceId: 'user-workspace-id',
    workspaceMemberId: 'member-id',
    workspace,
  };

  const buildService = ({
    inputAsk = chatInputAsk,
    toolPart = questionPart,
    hasClaimedStream = true,
    hasAnswered = true,
    hasPermission = true,
    hasSubmittedForm = true,
    hasOtherPendingAsks = false,
  }: BuildOptions = {}) => {
    const publishedEvents: Array<{ type: string }> = [];
    const agentChatService = {
      findToolPart: jest.fn().mockResolvedValue(toolPart),
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
      findReadable: jest.fn().mockResolvedValue(inputAsk),
      answer: jest.fn().mockResolvedValue(hasAnswered),
      hasPendingForThread: jest.fn().mockResolvedValue(hasOtherPendingAsks),
    };
    const workflowRunnerWorkspaceService = {
      resumeAnsweredAgentStep: jest.fn().mockResolvedValue(undefined),
      submitFormStep: jest.fn().mockResolvedValue(hasSubmittedForm),
    };
    const workflowRunWorkspaceService = {
      resolveStepAwaitingToolCall: jest
        .fn()
        .mockResolvedValue({ status: 'RESOLVED', stepId: 'step-id' }),
      endWorkflowRun: jest.fn().mockResolvedValue(undefined),
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
    const toolRegistryService = {
      resolveAndExecute: jest.fn().mockResolvedValue({
        success: true,
        message: 'Email sent successfully to tim@apple.dev',
        result: { messageId: 'sent-message-id' },
      }),
    };

    const service = new AnswerAskService(
      agentChatService as never,
      agentChatStreamingService as never,
      actorService as never,
      eventPublisherService as never,
      inputAskWorkspaceService as never,
      workflowRunnerWorkspaceService as never,
      workflowRunWorkspaceService as never,
      permissionsService as never,
      new AgentChatTurnPreflightService(
        aiModelRegistryService as never,
        agentChatService as never,
        aiBillingService as never,
      ),
      workspaceOrmManager as never,
      {
        getOrRecompute: jest.fn().mockResolvedValue({
          userWorkspaceRoleMap: { 'user-workspace-id': 'role-id' },
        }),
      } as never,
      {
        buildUserAndAgentActorContext: jest.fn().mockResolvedValue({
          actorContext: {},
          roleId: 'role-id',
          userId: 'user-id',
          userContext: { locale: 'en' },
        }),
      } as never,
      toolRegistryService as never,
    );

    return {
      service,
      agentChatService,
      agentChatStreamingService,
      inputAskWorkspaceService,
      workflowRunnerWorkspaceService,
      workflowRunWorkspaceService,
      permissionsService,
      workflowRunRepository,
      toolRegistryService,
      publishedEvents,
    };
  };

  it('treats an Ask the caller cannot read as not found', async () => {
    const { service } = buildService({ inputAsk: null });

    await expect(service.answer(answerArguments)).rejects.toMatchObject({
      code: 'ASK_NOT_FOUND',
    });
  });

  it('refuses an Ask that is no longer pending before touching anything', async () => {
    const { service, agentChatStreamingService, agentChatService } =
      buildService({
        inputAsk: { ...chatInputAsk, status: InputAskStatus.ANSWERED },
      });

    await expect(service.answer(answerArguments)).rejects.toMatchObject({
      code: 'ASK_NOT_PENDING',
    });
    expect(agentChatStreamingService.tryClaimStream).not.toHaveBeenCalled();
    expect(agentChatService.addMessage).not.toHaveBeenCalled();
  });

  describe('a chat tool call', () => {
    it('answers the Ask once, records the answer and resumes the stream', async () => {
      const {
        service,
        agentChatService,
        agentChatStreamingService,
        inputAskWorkspaceService,
        publishedEvents,
      } = buildService();

      const result = await service.answer(answerArguments);

      expect(result).toEqual({
        streamId: expect.any(String),
        threadId: 'thread-id',
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
      expect(
        agentChatStreamingService.enqueueResumeStream,
      ).toHaveBeenCalledWith(
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

    it('records the answer but leaves the agent paused while another call of the step waits', async () => {
      const {
        service,
        agentChatService,
        agentChatStreamingService,
        publishedEvents,
      } = buildService({ hasOtherPendingAsks: true });

      const result = await service.answer(answerArguments);

      expect(result).toEqual({
        streamId: null,
        threadId: 'thread-id',
        turnId: 'answer-turn',
      });
      expect(agentChatService.updateToolPartOutput).toHaveBeenCalled();
      expect(agentChatService.addMessage).toHaveBeenCalled();
      expect(
        agentChatStreamingService.enqueueResumeStream,
      ).not.toHaveBeenCalled();
      expect(agentChatStreamingService.releaseStreamClaim).toHaveBeenCalledWith(
        'thread-id',
        'workspace-id',
        expect.any(String),
      );
      expect(publishedEvents).toContainEqual({
        type: 'tool-call-resolved',
        toolCallId: 'tool-call-id',
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
    ])('rejects a response the call cannot accept (%j)', async (response) => {
      const { service, inputAskWorkspaceService } = buildService();

      await expect(
        service.answer({ ...answerArguments, response }),
      ).rejects.toMatchObject({ code: 'INVALID_ASK_RESPONSE' });
      expect(inputAskWorkspaceService.answer).not.toHaveBeenCalled();
    });

    it('refuses someone without the AI permission', async () => {
      const { service, inputAskWorkspaceService } = buildService({
        hasPermission: false,
      });

      await expect(service.answer(answerArguments)).rejects.toMatchObject({
        code: 'ASK_ANSWER_FORBIDDEN',
      });
      expect(inputAskWorkspaceService.answer).not.toHaveBeenCalled();
    });

    it('refuses while another response holds the stream, without answering', async () => {
      const { service, inputAskWorkspaceService } = buildService({
        hasClaimedStream: false,
      });

      await expect(service.answer(answerArguments)).rejects.toMatchObject({
        code: 'ASK_NOT_PENDING',
      });
      expect(inputAskWorkspaceService.answer).not.toHaveBeenCalled();
    });

    it('releases the stream it claimed when another answer won the Ask', async () => {
      const { service, agentChatStreamingService, agentChatService } =
        buildService({ hasAnswered: false });

      await expect(service.answer(answerArguments)).rejects.toMatchObject({
        code: 'ASK_NOT_PENDING',
      });

      const [[{ streamId: claimedStreamId }]] =
        agentChatStreamingService.tryClaimStream.mock.calls;

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

      await expect(service.answer(answerArguments)).rejects.toThrow(
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

  describe('an email approval', () => {
    const emailInputAsk = {
      ...chatInputAsk,
      form: { kind: 'emailApproval', email: PROPOSED_EMAIL },
    };
    const emailPart = {
      ...questionPart,
      toolName: 'propose_email',
      toolInput: PROPOSED_EMAIL,
      toolOutput: { result: { status: 'pending', email: PROPOSED_EMAIL } },
    };

    it('sends the edited email as the person only once the Ask is answered', async () => {
      const {
        service,
        toolRegistryService,
        inputAskWorkspaceService,
        agentChatService,
      } = buildService({ inputAsk: emailInputAsk, toolPart: emailPart });
      const editedEmail = { ...PROPOSED_EMAIL, subject: 'Your renewal' };

      // The email goes out as whoever answered, from their request.
      await withWorkspaceAuthContext(
        {
          type: 'user',
          workspace: { id: 'workspace-id' },
          userWorkspaceId: 'user-workspace-id',
        } as never,
        () =>
          service.answer({
            ...answerArguments,
            response: { decision: 'send', email: editedEmail },
          }),
      );

      expect(toolRegistryService.resolveAndExecute).toHaveBeenCalledWith(
        'send_email',
        {
          recipients: PROPOSED_EMAIL.recipients,
          subject: 'Your renewal',
          body: '<p>Hi Tim,</p><p>Your plan renews next week.</p>',
        },
        expect.objectContaining({
          userWorkspaceId: 'user-workspace-id',
          roleId: 'role-id',
        }),
      );
      expect(
        inputAskWorkspaceService.answer.mock.invocationCallOrder[0],
      ).toBeLessThan(
        toolRegistryService.resolveAndExecute.mock.invocationCallOrder[0],
      );
      expect(agentChatService.updateToolPartOutput).toHaveBeenCalledWith(
        expect.objectContaining({
          toolOutput: expect.objectContaining({
            success: true,
            result: expect.objectContaining({
              status: 'sent',
              email: editedEmail,
            }),
          }),
        }),
      );
    });

    it('sends nothing when the person discards the email', async () => {
      const { service, toolRegistryService, agentChatService } = buildService({
        inputAsk: emailInputAsk,
        toolPart: emailPart,
      });

      await service.answer({
        ...answerArguments,
        response: { decision: 'discard' },
      });

      expect(toolRegistryService.resolveAndExecute).not.toHaveBeenCalled();
      expect(agentChatService.updateToolPartOutput).toHaveBeenCalledWith(
        expect.objectContaining({
          toolOutput: expect.objectContaining({
            result: expect.objectContaining({ status: 'discarded' }),
          }),
        }),
      );
    });

    it('sends nothing when another answer already claimed the Ask', async () => {
      const { service, toolRegistryService } = buildService({
        inputAsk: emailInputAsk,
        toolPart: emailPart,
        hasAnswered: false,
      });

      await expect(
        service.answer({
          ...answerArguments,
          response: { decision: 'send', email: PROPOSED_EMAIL },
        }),
      ).rejects.toMatchObject({ code: 'ASK_NOT_PENDING' });
      expect(toolRegistryService.resolveAndExecute).not.toHaveBeenCalled();
    });
  });

  describe('a workflow agent step', () => {
    const runInputAsk = {
      ...chatInputAsk,
      workflowRunId: 'workflow-run-id',
      stepId: 'step-id',
    };

    it('hands the answer to the run, with no chat stream', async () => {
      const {
        service,
        workflowRunnerWorkspaceService,
        workflowRunWorkspaceService,
        agentChatStreamingService,
        permissionsService,
        publishedEvents,
      } = buildService({ inputAsk: runInputAsk });

      expect(await service.answer(answerArguments)).toEqual({
        streamId: null,
        threadId: null,
        turnId: null,
      });
      expect(
        permissionsService.userHasWorkspaceSettingPermission,
      ).toHaveBeenCalledWith(expect.objectContaining({ setting: 'WORKFLOWS' }));
      expect(
        workflowRunWorkspaceService.resolveStepAwaitingToolCall,
      ).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        workflowRunId: 'workflow-run-id',
        threadId: 'thread-id',
        toolCallId: 'tool-call-id',
        response: { answers: ANSWERS },
      });
      expect(
        workflowRunnerWorkspaceService.resumeAnsweredAgentStep,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          stepId: 'step-id',
          toolPart: questionPart,
          answerText: 'Which plan?\nTeam',
          senderUserWorkspaceId: 'user-workspace-id',
        }),
      );
      expect(workflowRunWorkspaceService.endWorkflowRun).not.toHaveBeenCalled();
      expect(agentChatStreamingService.tryClaimStream).not.toHaveBeenCalled();
      expect(publishedEvents).toContainEqual({
        type: 'tool-call-resolved',
        toolCallId: 'tool-call-id',
      });
    });

    it('refuses an answer the run no longer waits for', async () => {
      const {
        service,
        workflowRunnerWorkspaceService,
        workflowRunWorkspaceService,
      } = buildService({ inputAsk: runInputAsk });

      workflowRunWorkspaceService.resolveStepAwaitingToolCall.mockResolvedValue(
        { status: 'NOT_AWAITING' },
      );

      await expect(service.answer(answerArguments)).rejects.toMatchObject({
        code: 'ASK_NOT_PENDING',
      });
      expect(
        workflowRunnerWorkspaceService.resumeAnsweredAgentStep,
      ).not.toHaveBeenCalled();
    });

    it('fails the run when the answered step cannot resume', async () => {
      const {
        service,
        workflowRunnerWorkspaceService,
        workflowRunWorkspaceService,
      } = buildService({ inputAsk: runInputAsk });

      workflowRunnerWorkspaceService.resumeAnsweredAgentStep.mockRejectedValue(
        new Error('Queue unavailable'),
      );

      await expect(service.answer(answerArguments)).rejects.toThrow(
        'Queue unavailable',
      );
      expect(workflowRunWorkspaceService.endWorkflowRun).toHaveBeenCalledWith(
        expect.objectContaining({
          workflowRunId: 'workflow-run-id',
          workspaceId: 'workspace-id',
          status: 'FAILED',
        }),
      );
    });

    it('treats a run the caller cannot read as not found', async () => {
      const { service, workflowRunRepository, workflowRunWorkspaceService } =
        buildService({ inputAsk: runInputAsk });

      workflowRunRepository.findOne.mockResolvedValue(null);

      await expect(service.answer(answerArguments)).rejects.toMatchObject({
        code: 'ASK_NOT_FOUND',
      });
      expect(
        workflowRunWorkspaceService.resolveStepAwaitingToolCall,
      ).not.toHaveBeenCalled();
    });
  });

  describe('a form step', () => {
    const formInputAsk = {
      id: 'ask-id',
      status: InputAskStatus.PENDING,
      form: {
        kind: 'formFields',
        fields: [
          { id: 'field-id', name: 'discount', label: 'Discount', type: 'TEXT' },
        ],
      },
      threadId: null,
      toolCallId: null,
      workflowRunId: 'workflow-run-id',
      stepId: 'step-id',
    };

    it('submits the form step with the response', async () => {
      const { service, workflowRunnerWorkspaceService } = buildService({
        inputAsk: formInputAsk,
      });

      expect(
        await service.answer({
          ...answerArguments,
          response: { discount: '20%' },
        }),
      ).toEqual({ streamId: null, threadId: null, turnId: null });
      expect(
        workflowRunnerWorkspaceService.submitFormStep,
      ).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        workflowRunId: 'workflow-run-id',
        stepId: 'step-id',
        response: { discount: '20%' },
      });
    });

    it('rejects a response naming a field the form does not have', async () => {
      const { service, workflowRunnerWorkspaceService } = buildService({
        inputAsk: formInputAsk,
      });

      await expect(
        service.answer({ ...answerArguments, response: { price: 10 } }),
      ).rejects.toMatchObject({ code: 'INVALID_ASK_RESPONSE' });
      expect(
        workflowRunnerWorkspaceService.submitFormStep,
      ).not.toHaveBeenCalled();
    });

    it('refuses a submission the form no longer waits for', async () => {
      const { service } = buildService({
        inputAsk: formInputAsk,
        hasSubmittedForm: false,
      });

      await expect(
        service.answer({ ...answerArguments, response: { discount: '20%' } }),
      ).rejects.toMatchObject({ code: 'ASK_NOT_PENDING' });
    });

    it('refuses someone without the Workflows permission', async () => {
      const { service, workflowRunnerWorkspaceService } = buildService({
        inputAsk: formInputAsk,
        hasPermission: false,
      });

      await expect(
        service.answer({ ...answerArguments, response: { discount: '20%' } }),
      ).rejects.toMatchObject({ code: 'ASK_ANSWER_FORBIDDEN' });
      expect(
        workflowRunnerWorkspaceService.submitFormStep,
      ).not.toHaveBeenCalled();
    });
  });
});
