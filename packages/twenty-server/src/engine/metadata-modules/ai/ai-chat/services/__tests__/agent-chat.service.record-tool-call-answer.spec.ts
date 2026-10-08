import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

const buildService = () => {
  const recordEventService = { emit: jest.fn().mockResolvedValue(undefined) };
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

  const service = new AgentChatService(
    {} as never,
    {} as never,
    {} as never,
    messagePartRepository as never,
    {} as never,
    {} as never,
    {} as never,
    recordEventService as never,
    {} as never,
    {} as never,
    { hasUpgradedAgentHistory: jest.fn().mockResolvedValue(true) } as never,
  );

  return { service, messagePartRepository, recordEventService };
};

describe('AgentChatService recordToolCallAnswer', () => {
  const answerArguments = {
    threadId: 'thread-id',
    messageId: 'question-message-id',
    partId: 'part-id',
    toolOutput: { result: { status: 'answered' } },
    workspaceId: 'workspace-id',
  };

  it('tells open chat lists once the last answer stops the wait', async () => {
    const { service, messagePartRepository, recordEventService } =
      buildService();

    const threadBefore = {
      id: 'thread-id',
      pendingQuestionMessageId: 'question-message-id',
    };
    const threadAfter = { id: 'thread-id', pendingQuestionMessageId: null };

    messagePartRepository.writePart
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([threadBefore])
      .mockResolvedValueOnce([threadAfter]);

    await service.recordToolCallAnswer({
      ...answerArguments,
      isLastAnswer: true,
    });

    expect(recordEventService.emit).toHaveBeenCalledWith(
      expect.objectContaining({ before: threadBefore, after: threadAfter }),
    );
  });

  it('stays quiet when another caller already stopped the wait', async () => {
    const { service, messagePartRepository, recordEventService } =
      buildService();

    messagePartRepository.writePart
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await service.recordToolCallAnswer({
      ...answerArguments,
      isLastAnswer: true,
    });

    expect(recordEventService.emit).toHaveBeenCalledWith(
      expect.objectContaining({ after: undefined }),
    );
  });

  it('stays quiet while other calls still wait on an answer', async () => {
    const { service, recordEventService } = buildService();

    await service.recordToolCallAnswer({
      ...answerArguments,
      isLastAnswer: false,
    });

    expect(recordEventService.emit).toHaveBeenCalledWith(
      expect.objectContaining({ after: undefined }),
    );
  });
});
