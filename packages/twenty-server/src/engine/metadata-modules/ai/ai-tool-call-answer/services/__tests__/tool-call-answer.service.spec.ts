import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatTurnPreflightService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-preflight.service';
import { ToolCallAnswerService } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/services/tool-call-answer.service';

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

const FORM_FIELDS = [
  { id: 'field-id', name: 'discount', label: 'Discount', type: 'TEXT' },
];

const questionPart = {
  id: 'part-id',
  messageId: 'question-message-id',
  turnId: 'question-turn-id',
  toolName: 'ask_questions',
  toolInput: { questions: QUESTIONS },
  toolOutput: { result: { questions: QUESTIONS, status: 'pending' } },
};

const waitingThread = {
  id: 'thread-id',
  workflowRunId: null as string | null,
  activeStreamId: null,
  pendingQuestionMessageId: 'question-message-id',
};

type BuildOptions = {
  thread?: typeof waitingThread | null;
  toolPart?: Record<string, unknown> | null;
  hasClaimedStream?: boolean;
  isStillAwaiting?: boolean;
  hasOtherAwaitingCalls?: boolean;
  hasPermission?: boolean;
};

describe('ToolCallAnswerService', () => {
  const workspace = { id: 'workspace-id' } as WorkspaceEntity;

  const answerArguments = {
    threadId: 'thread-id',
    toolCallId: 'tool-call-id',
    response: { answers: ANSWERS } as Record<string, unknown>,
    userWorkspaceId: 'user-workspace-id',
    workspaceMemberId: 'member-id',
    workspace,
  };

  const buildService = ({
    thread = waitingThread,
    toolPart = questionPart,
    hasClaimedStream = true,
    isStillAwaiting = true,
    hasOtherAwaitingCalls = false,
    hasPermission = true,
  }: BuildOptions = {}) => {
    const publishedEvents: Array<{ type: string }> = [];
    const threadRepository = {
      findOne: jest.fn().mockResolvedValue(thread),
    };
    const agentChatService = {
      findToolPart: jest.fn().mockResolvedValue(toolPart),
      findAwaitingToolParts: jest
        .fn()
        .mockResolvedValue([
          ...(isStillAwaiting ? [toolPart] : []),
          ...(hasOtherAwaitingCalls ? [{ id: 'other-part-id' }] : []),
        ]),
      getWritableThread: jest.fn().mockResolvedValue(thread),
      recordToolCallAnswer: jest.fn().mockResolvedValue(undefined),
      addMessage: jest
        .fn()
        .mockResolvedValue({ id: 'answer-message-id', turnId: 'answer-turn' }),
      closePendingToolCalls: jest.fn().mockResolvedValue(undefined),
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
    const workflowRunnerWorkspaceService = {
      resumeAnsweredStep: jest.fn().mockResolvedValue(undefined),
    };
    const step = { id: 'step-id', type: 'AI_AGENT' };
    const workflowRunWorkspaceService = {
      findStepAwaitingAnswer: jest.fn().mockResolvedValue(step),
      endWorkflowRun: jest.fn().mockResolvedValue(undefined),
      getWorkflowRun: jest.fn().mockResolvedValue({
        state: { stepInfos: { 'step-id': { threadId: 'thread-id' } } },
      }),
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

    const service = new ToolCallAnswerService(
      threadRepository as never,
      agentChatService as never,
      agentChatStreamingService as never,
      actorService as never,
      eventPublisherService as never,
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
      step,
      agentChatService,
      agentChatStreamingService,
      workflowRunnerWorkspaceService,
      workflowRunWorkspaceService,
      permissionsService,
      workflowRunRepository,
      toolRegistryService,
      publishedEvents,
    };
  };

  it('treats a tool call it cannot find as not found', async () => {
    const { service } = buildService({ toolPart: null });

    await expect(service.answer(answerArguments)).rejects.toMatchObject({
      code: 'TOOL_CALL_NOT_FOUND',
    });
  });

  it('refuses a call the conversation no longer waits on, before touching anything', async () => {
    const { service, agentChatStreamingService, agentChatService } =
      buildService({
        thread: { ...waitingThread, pendingQuestionMessageId: 'later-id' },
      });

    await expect(service.answer(answerArguments)).rejects.toMatchObject({
      code: 'TOOL_CALL_NOT_PENDING',
    });
    expect(agentChatStreamingService.tryClaimStream).not.toHaveBeenCalled();
    expect(agentChatService.addMessage).not.toHaveBeenCalled();
  });

  describe('a chat tool call', () => {
    it('records the answer, stops waiting and resumes the stream, claimed only while the conversation waits on the call', async () => {
      const {
        service,
        agentChatService,
        agentChatStreamingService,
        publishedEvents,
      } = buildService();

      const result = await service.answer(answerArguments);

      expect(result).toEqual({
        streamId: expect.any(String),
        turnId: 'answer-turn',
      });
      expect(agentChatStreamingService.tryClaimStream).toHaveBeenCalledWith({
        threadId: 'thread-id',
        workspaceId: 'workspace-id',
        streamId: result.streamId,
        where: { pendingQuestionMessageId: 'question-message-id' },
      });
      expect(agentChatService.recordToolCallAnswer).toHaveBeenCalledWith({
        threadId: 'thread-id',
        messageId: 'question-message-id',
        partId: 'part-id',
        isLastAnswer: true,
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
      const { service, agentChatService, agentChatStreamingService } =
        buildService({ hasOtherAwaitingCalls: true });

      expect(await service.answer(answerArguments)).toEqual({
        streamId: null,
        turnId: 'answer-turn',
      });
      expect(agentChatService.recordToolCallAnswer).toHaveBeenCalledWith(
        expect.objectContaining({ isLastAnswer: false }),
      );
      expect(
        agentChatStreamingService.enqueueResumeStream,
      ).not.toHaveBeenCalled();
      expect(agentChatStreamingService.releaseStreamClaim).toHaveBeenCalledWith(
        'thread-id',
        'workspace-id',
        expect.any(String),
      );
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
      const { service, agentChatStreamingService } = buildService();

      await expect(
        service.answer({ ...answerArguments, response }),
      ).rejects.toMatchObject({ code: 'INVALID_TOOL_CALL_OUTPUT' });
      expect(agentChatStreamingService.tryClaimStream).not.toHaveBeenCalled();
    });

    it('refuses someone without the AI permission', async () => {
      const { service, agentChatStreamingService } = buildService({
        hasPermission: false,
      });

      await expect(service.answer(answerArguments)).rejects.toMatchObject({
        code: 'TOOL_CALL_RESOLUTION_FORBIDDEN',
      });
      expect(agentChatStreamingService.tryClaimStream).not.toHaveBeenCalled();
    });

    it('refuses while another answer or response holds the conversation, recording nothing', async () => {
      const { service, agentChatService } = buildService({
        hasClaimedStream: false,
      });

      await expect(service.answer(answerArguments)).rejects.toMatchObject({
        code: 'TOOL_CALL_NOT_PENDING',
      });
      expect(agentChatService.recordToolCallAnswer).not.toHaveBeenCalled();
    });

    it('releases the conversation it claimed when an earlier answer already closed the call', async () => {
      const { service, agentChatStreamingService, agentChatService } =
        buildService({ isStillAwaiting: false });

      await expect(service.answer(answerArguments)).rejects.toMatchObject({
        code: 'TOOL_CALL_NOT_PENDING',
      });

      const [[{ streamId: claimedStreamId }]] =
        agentChatStreamingService.tryClaimStream.mock.calls;

      expect(agentChatStreamingService.releaseStreamClaim).toHaveBeenCalledWith(
        'thread-id',
        'workspace-id',
        claimedStreamId,
      );
      expect(agentChatService.recordToolCallAnswer).not.toHaveBeenCalled();
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
    });
  });

  describe('an email approval', () => {
    const emailPart = {
      ...questionPart,
      toolName: 'propose_email',
      toolInput: PROPOSED_EMAIL,
      toolOutput: { result: { status: 'pending', email: PROPOSED_EMAIL } },
    };

    it('sends the edited email as the person, only once the conversation is claimed', async () => {
      const {
        service,
        toolRegistryService,
        agentChatStreamingService,
        agentChatService,
      } = buildService({ toolPart: emailPart });
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
        agentChatStreamingService.tryClaimStream.mock.invocationCallOrder[0],
      ).toBeLessThan(
        toolRegistryService.resolveAndExecute.mock.invocationCallOrder[0],
      );
      expect(agentChatService.recordToolCallAnswer).toHaveBeenCalledWith(
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
        toolPart: emailPart,
      });

      await service.answer({
        ...answerArguments,
        response: { decision: 'discard' },
      });

      expect(toolRegistryService.resolveAndExecute).not.toHaveBeenCalled();
      expect(agentChatService.recordToolCallAnswer).toHaveBeenCalledWith(
        expect.objectContaining({
          toolOutput: expect.objectContaining({
            result: expect.objectContaining({ status: 'discarded' }),
          }),
        }),
      );
    });

    it('sends nothing when an earlier answer already closed the call', async () => {
      const { service, toolRegistryService } = buildService({
        toolPart: emailPart,
        isStillAwaiting: false,
      });

      await expect(
        service.answer({
          ...answerArguments,
          response: { decision: 'send', email: PROPOSED_EMAIL },
        }),
      ).rejects.toMatchObject({ code: 'TOOL_CALL_NOT_PENDING' });
      expect(toolRegistryService.resolveAndExecute).not.toHaveBeenCalled();
    });
  });

  describe('a call in a workflow run', () => {
    const runThread = { ...waitingThread, workflowRunId: 'workflow-run-id' };

    it('records the answer and hands it to the run, with no chat stream', async () => {
      const {
        service,
        step,
        agentChatService,
        agentChatStreamingService,
        workflowRunnerWorkspaceService,
        workflowRunWorkspaceService,
        permissionsService,
      } = buildService({ thread: runThread });

      expect(await service.answer(answerArguments)).toEqual({
        streamId: null,
        turnId: 'answer-turn',
      });
      expect(
        permissionsService.userHasWorkspaceSettingPermission,
      ).toHaveBeenCalledWith(expect.objectContaining({ setting: 'WORKFLOWS' }));
      expect(agentChatService.getWritableThread).not.toHaveBeenCalled();
      expect(agentChatService.recordToolCallAnswer).toHaveBeenCalledWith(
        expect.objectContaining({ isLastAnswer: true }),
      );
      expect(agentChatStreamingService.releaseStreamClaim).toHaveBeenCalled();
      expect(
        workflowRunnerWorkspaceService.resumeAnsweredStep,
      ).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        workflowRunId: 'workflow-run-id',
        step,
        threadId: 'thread-id',
        response: { answers: ANSWERS },
      });
      expect(workflowRunWorkspaceService.endWorkflowRun).not.toHaveBeenCalled();
    });

    it('resumes nothing while another call of the step waits', async () => {
      const { service, workflowRunnerWorkspaceService } = buildService({
        thread: runThread,
        hasOtherAwaitingCalls: true,
      });

      await service.answer(answerArguments);

      expect(
        workflowRunnerWorkspaceService.resumeAnsweredStep,
      ).not.toHaveBeenCalled();
    });

    it('refuses an answer the run no longer waits for, closing its calls instead', async () => {
      const {
        service,
        agentChatService,
        agentChatStreamingService,
        workflowRunWorkspaceService,
      } = buildService({ thread: runThread });

      workflowRunWorkspaceService.findStepAwaitingAnswer.mockResolvedValue(
        null,
      );

      await expect(service.answer(answerArguments)).rejects.toMatchObject({
        code: 'TOOL_CALL_NOT_PENDING',
      });
      expect(agentChatService.recordToolCallAnswer).not.toHaveBeenCalled();
      expect(agentChatService.closePendingToolCalls).toHaveBeenCalledWith({
        threadId: 'thread-id',
        messageId: 'question-message-id',
        workspaceId: 'workspace-id',
      });
      expect(agentChatStreamingService.releaseStreamClaim).toHaveBeenCalled();
    });

    it('fails the run when the answer is recorded but its message cannot be added', async () => {
      const {
        service,
        agentChatService,
        workflowRunnerWorkspaceService,
        workflowRunWorkspaceService,
      } = buildService({ thread: runThread });

      agentChatService.addMessage.mockRejectedValue(new Error('Write failed'));

      await expect(service.answer(answerArguments)).rejects.toThrow(
        'Write failed',
      );
      expect(
        workflowRunnerWorkspaceService.resumeAnsweredStep,
      ).not.toHaveBeenCalled();
      expect(workflowRunWorkspaceService.endWorkflowRun).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'FAILED' }),
      );
    });

    it('fails the run when the answered step cannot resume', async () => {
      const {
        service,
        workflowRunnerWorkspaceService,
        workflowRunWorkspaceService,
      } = buildService({ thread: runThread });

      workflowRunnerWorkspaceService.resumeAnsweredStep.mockRejectedValue(
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
      const { service, workflowRunRepository, agentChatStreamingService } =
        buildService({ thread: runThread });

      workflowRunRepository.findOne.mockResolvedValue(null);

      await expect(service.answer(answerArguments)).rejects.toMatchObject({
        code: 'TOOL_CALL_NOT_FOUND',
      });
      expect(agentChatStreamingService.tryClaimStream).not.toHaveBeenCalled();
    });

    describe('issued by a form step', () => {
      const formPart = {
        ...questionPart,
        toolName: 'request_form',
        toolInput: { fields: FORM_FIELDS },
        toolOutput: { result: { status: 'pending' } },
      };

      it('hands the values to the run', async () => {
        const { service, workflowRunnerWorkspaceService } = buildService({
          thread: runThread,
          toolPart: formPart,
        });

        await service.answer({
          ...answerArguments,
          toolCallId: 'step-id',
          response: { discount: '20%' },
        });

        expect(
          workflowRunnerWorkspaceService.resumeAnsweredStep,
        ).toHaveBeenCalledWith(
          expect.objectContaining({ response: { discount: '20%' } }),
        );
      });

      it('rejects a value for a field the form does not have', async () => {
        const { service, agentChatStreamingService } = buildService({
          thread: runThread,
          toolPart: formPart,
        });

        await expect(
          service.answer({ ...answerArguments, response: { price: 10 } }),
        ).rejects.toMatchObject({ code: 'INVALID_TOOL_CALL_OUTPUT' });
        expect(agentChatStreamingService.tryClaimStream).not.toHaveBeenCalled();
      });

      it('refuses someone without the Workflows permission', async () => {
        const { service, workflowRunnerWorkspaceService } = buildService({
          thread: runThread,
          toolPart: formPart,
          hasPermission: false,
        });

        await expect(
          service.answer({ ...answerArguments, response: { discount: '20%' } }),
        ).rejects.toMatchObject({ code: 'TOOL_CALL_RESOLUTION_FORBIDDEN' });
        expect(
          workflowRunnerWorkspaceService.resumeAnsweredStep,
        ).not.toHaveBeenCalled();
      });
    });
  });

  describe('the deprecated entry points', () => {
    it('answers a form step through the call named after it in its conversation', async () => {
      const { service, agentChatService } = buildService({
        thread: { ...waitingThread, workflowRunId: 'workflow-run-id' },
        toolPart: {
          ...questionPart,
          toolName: 'request_form',
          toolInput: { fields: FORM_FIELDS },
          toolOutput: { result: { status: 'pending' } },
        },
      });

      await service.answerFormStep({
        workflowRunId: 'workflow-run-id',
        stepId: 'step-id',
        response: { discount: '20%' },
        userWorkspaceId: 'user-workspace-id',
        workspaceMemberId: 'member-id',
        workspace,
      });

      expect(agentChatService.findToolPart).toHaveBeenCalledWith({
        threadId: 'thread-id',
        toolCallId: 'step-id',
        workspaceId: 'workspace-id',
      });
    });

    it('answers the questions a message asked', async () => {
      const { service, agentChatService } = buildService();

      agentChatService.findAwaitingToolParts.mockResolvedValueOnce([
        { ...questionPart, toolCallId: 'tool-call-id' },
      ]);

      await service.answerQuestionsOfMessage({
        threadId: 'thread-id',
        messageId: 'question-message-id',
        response: { answers: ANSWERS },
        userWorkspaceId: 'user-workspace-id',
        workspaceMemberId: 'member-id',
        workspace,
      });

      expect(agentChatService.findToolPart).toHaveBeenCalledWith({
        threadId: 'thread-id',
        toolCallId: 'tool-call-id',
        workspaceId: 'workspace-id',
      });
      expect(agentChatService.recordToolCallAnswer).toHaveBeenCalled();
    });
  });
});
