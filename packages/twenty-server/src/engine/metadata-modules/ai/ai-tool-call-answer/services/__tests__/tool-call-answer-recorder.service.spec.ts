import { ToolCallAnswerRecorderService } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/services/tool-call-answer-recorder.service';

const buildService = () => {
  const threadRecordEventService = {
    emitPendingQuestionCleared: jest.fn().mockResolvedValue(undefined),
  };
  const turnEventPublisherService = {
    publish: jest.fn().mockResolvedValue(undefined),
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

  const service = new ToolCallAnswerRecorderService(
    messagePartRepository as never,
    threadRecordEventService as never,
    {} as never,
    turnEventPublisherService as never,
  );

  return {
    service,
    messagePartRepository,
    threadRecordEventService,
    turnEventPublisherService,
  };
};

describe('ToolCallAnswerRecorderService recordToolCallAnswer', () => {
  const answerArguments = {
    threadId: 'thread-id',
    messageId: 'question-message-id',
    partId: 'part-id',
    toolOutput: { result: { status: 'answered' } },
    workspaceId: 'workspace-id',
    resolveMentionForWorkspaceMemberId: null,
  };

  it('tells open chat lists once the last answer stops the wait', async () => {
    const {
      service,
      messagePartRepository,
      threadRecordEventService,
      turnEventPublisherService,
    } = buildService();

    messagePartRepository.writePart
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ id: 'thread-id' }])
      .mockResolvedValueOnce([{ id: 'turn-id' }]);

    await service.recordToolCallAnswer({
      ...answerArguments,
      isLastAnswer: true,
    });

    expect(
      threadRecordEventService.emitPendingQuestionCleared,
    ).toHaveBeenCalledTimes(1);
    expect(turnEventPublisherService.publish).toHaveBeenCalledTimes(1);
    expect(turnEventPublisherService.publish).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      type: 'updated',
      turnIds: ['turn-id'],
    });
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

  it('stays quiet while other calls still wait on an answer', async () => {
    const { service, threadRecordEventService } = buildService();

    await service.recordToolCallAnswer({
      ...answerArguments,
      isLastAnswer: false,
    });

    expect(
      threadRecordEventService.emitPendingQuestionCleared,
    ).not.toHaveBeenCalled();
  });
});
