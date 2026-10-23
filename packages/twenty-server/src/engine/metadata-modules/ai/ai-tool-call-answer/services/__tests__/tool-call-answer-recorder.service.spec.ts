import { ToolCallAnswerRecorderService } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/services/tool-call-answer-recorder.service';

const buildService = () => {
  const threadRecordEventService = {
    emitPendingQuestionCleared: jest.fn().mockResolvedValue(undefined),
  };
  const messagePartRepository = {
    writePart: jest.fn(),
    query: jest.fn(),
  };

  messagePartRepository.query.mockImplementation(async (_workspaceId, run) =>
    run({
      table: (name: string) => name,
      manager: { query: messagePartRepository.writePart },
    }),
  );

  const participantService = {
    resolveMention: jest.fn().mockImplementation(async ({ writeResponse }) =>
      writeResponse({
        table: (name: string) => name,
        manager: { query: messagePartRepository.writePart },
      }),
    ),
  };

  const service = new ToolCallAnswerRecorderService(
    messagePartRepository as never,
    threadRecordEventService as never,
    participantService as never,
  );

  return {
    service,
    messagePartRepository,
    threadRecordEventService,
    participantService,
  };
};

describe('ToolCallAnswerRecorderService recordToolCallAnswer', () => {
  const answerArguments = {
    threadId: 'thread-id',
    messageId: 'question-message-id',
    partId: 'part-id',
    toolOutput: { result: { status: 'answered' } },
    workspaceId: 'workspace-id',
    workspaceMemberId: 'answering-member-id',
  };

  it('tells open chat lists once the last answer stops the wait', async () => {
    const { service, messagePartRepository, threadRecordEventService } =
      buildService();

    messagePartRepository.writePart
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ id: 'thread-id' }]);

    await service.recordToolCallAnswer({
      ...answerArguments,
      isLastAnswer: true,
    });

    expect(
      threadRecordEventService.emitPendingQuestionCleared,
    ).toHaveBeenCalledTimes(1);
  });

  it('stays quiet when another caller already stopped the wait', async () => {
    const { service, messagePartRepository, threadRecordEventService } =
      buildService();

    messagePartRepository.writePart
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([]);

    await service.recordToolCallAnswer({
      ...answerArguments,
      isLastAnswer: true,
    });

    expect(
      threadRecordEventService.emitPendingQuestionCleared,
    ).not.toHaveBeenCalled();
  });

  it('resolves the answering member while other calls still wait', async () => {
    const { service, threadRecordEventService, participantService } =
      buildService();

    await service.recordToolCallAnswer({
      ...answerArguments,
      isLastAnswer: false,
    });

    expect(participantService.resolveMention).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      workspaceMemberId: 'answering-member-id',
      threadId: 'thread-id',
      writeResponse: expect.any(Function),
    });
    expect(
      threadRecordEventService.emitPendingQuestionCleared,
    ).not.toHaveBeenCalled();
  });

  it('propagates answer persistence failure without publishing a cleared wait', async () => {
    const { service, messagePartRepository, threadRecordEventService } =
      buildService();
    const persistenceError = new Error('Answer could not be recorded');

    messagePartRepository.writePart.mockRejectedValueOnce(persistenceError);

    await expect(
      service.recordToolCallAnswer({
        ...answerArguments,
        isLastAnswer: true,
      }),
    ).rejects.toThrow(persistenceError);

    expect(messagePartRepository.writePart).toHaveBeenCalledTimes(1);
    expect(
      threadRecordEventService.emitPendingQuestionCleared,
    ).not.toHaveBeenCalled();
  });

  it('publishes the cleared wait only after answer and mention resolution commit', async () => {
    const { service, participantService, threadRecordEventService } =
      buildService();
    const transactionError = new Error('Answer transaction could not commit');

    participantService.resolveMention.mockRejectedValueOnce(transactionError);

    await expect(
      service.recordToolCallAnswer({
        ...answerArguments,
        isLastAnswer: true,
      }),
    ).rejects.toThrow(transactionError);

    expect(
      threadRecordEventService.emitPendingQuestionCleared,
    ).not.toHaveBeenCalled();
  });
});

describe('ToolCallAnswerRecorderService approval acceptance', () => {
  const approvalArguments = {
    threadId: 'thread-id',
    partId: 'part-id',
    toolOutput: { result: { status: 'running' } },
    workspaceId: 'workspace-id',
    workspaceMemberId: 'answering-member-id',
  };

  it('resolves the member in the same transaction that accepts a pending approval', async () => {
    const { service, messagePartRepository, participantService } =
      buildService();

    messagePartRepository.writePart.mockResolvedValueOnce([{ id: 'part-id' }]);

    await service.claimToolCallAnswer(approvalArguments);

    expect(participantService.resolveMention).toHaveBeenCalledWith({
      threadId: 'thread-id',
      workspaceId: 'workspace-id',
      workspaceMemberId: 'answering-member-id',
      writeResponse: expect.any(Function),
    });
    expect(messagePartRepository.query).not.toHaveBeenCalled();
  });

  it('rejects an approval that is no longer pending inside the resolution transaction', async () => {
    const { service, messagePartRepository } = buildService();

    messagePartRepository.writePart.mockResolvedValueOnce([]);

    await expect(
      service.claimToolCallAnswer(approvalArguments),
    ).rejects.toMatchObject({ code: 'TOOL_CALL_NOT_PENDING' });
  });

  it('does not resolve mentions again when recording an accepted approval outcome', async () => {
    const { service, messagePartRepository, participantService } =
      buildService();

    await service.recordToolCallAnswer({
      ...approvalArguments,
      messageId: 'question-message-id',
      toolOutput: { result: { status: 'approved' } },
      isLastAnswer: false,
      shouldResolveMention: false,
    });

    expect(participantService.resolveMention).not.toHaveBeenCalled();
    expect(messagePartRepository.query).toHaveBeenCalledTimes(1);
  });
});
