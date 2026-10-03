import { IsNull } from 'typeorm';

import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

const QUESTIONS = [
  {
    header: 'Plan',
    question: 'Which plan?',
    options: [{ label: 'Pro' }, { label: 'Team' }],
  },
];

const buildService = ({ claimAffected = 1 } = {}) => {
  const threadRepository = {
    update: jest.fn().mockResolvedValue({ affected: claimAffected }),
  };
  const messagePartRepository = {
    find: jest.fn().mockResolvedValue([
      {
        id: 'part-id',
        toolName: 'ask_question',
        toolInput: QUESTIONS[0],
        toolOutput: { result: { question: QUESTIONS[0], status: 'pending' } },
      },
    ]),
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
    threadRepository as never,
    {} as never,
    {} as never,
    messagePartRepository as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  return { service, threadRepository, messagePartRepository };
};

const closeArguments = {
  threadId: 'thread-id',
  messageId: 'question-message-id',
  workspaceId: 'workspace-id',
  where: { activeStreamId: IsNull() },
};

describe('AgentChatService closePendingToolCalls', () => {
  it('stops waiting and closes the pending call as skipped', async () => {
    const { service, threadRepository, messagePartRepository } = buildService();

    await service.closePendingToolCalls(closeArguments);

    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      {
        id: 'thread-id',
        pendingQuestionMessageId: 'question-message-id',
        activeStreamId: IsNull(),
      },
      { pendingQuestionMessageId: null },
    );
    const [[, [partId, closedToolOutput, expectedStatus]]] =
      messagePartRepository.writePart.mock.calls;

    expect({ partId, expectedStatus }).toEqual({
      partId: 'part-id',
      expectedStatus: 'pending',
    });
    expect(JSON.parse(closedToolOutput).result).toEqual({
      question: QUESTIONS[0],
      status: 'skipped',
    });
  });

  it('leaves the call as it is when an answer holds the conversation', async () => {
    const { service, messagePartRepository } = buildService({
      claimAffected: 0,
    });

    await service.closePendingToolCalls(closeArguments);

    expect(messagePartRepository.writePart).not.toHaveBeenCalled();
  });
});
