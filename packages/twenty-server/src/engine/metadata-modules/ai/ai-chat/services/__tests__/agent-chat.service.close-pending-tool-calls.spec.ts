import { IsNull } from 'typeorm';

import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
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
  const threadRecordEventService = {
    emitPendingQuestionCleared: jest.fn().mockResolvedValue(undefined),
  };
  const turnRecorderService = {
    endWaitingTurn: jest.fn().mockResolvedValue(undefined),
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
    threadRecordEventService as never,
    {} as never,
    {} as never,
    turnRecorderService as never,
  );

  return {
    service,
    threadRepository,
    messagePartRepository,
    threadRecordEventService,
    turnRecorderService,
  };
};

const closeArguments = {
  threadId: 'thread-id',
  messageId: 'question-message-id',
  workspaceId: 'workspace-id',
  where: { activeStreamId: IsNull() },
};

describe('AgentChatService closePendingToolCalls', () => {
  it('stops waiting and closes the pending call as skipped', async () => {
    const {
      service,
      threadRepository,
      messagePartRepository,
      turnRecorderService,
    } = buildService();

    await service.closePendingToolCalls(closeArguments);

    expect(turnRecorderService.endWaitingTurn).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      messageId: 'question-message-id',
      status: AgentTurnStatus.COMPLETED,
    });

    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      {
        id: 'thread-id',
        pendingQuestionMessageId: 'question-message-id',
        activeStreamId: IsNull(),
      },
      { pendingQuestionMessageId: null },
    );
    const [[closeQuery, [partId, closedToolOutput, expectedStatus]]] =
      messagePartRepository.writePart.mock.calls;

    expect(closeQuery).toContain(`"toolOutput"->'result'->>'status' = $3`);

    expect({ partId, expectedStatus }).toEqual({
      partId: 'part-id',
      expectedStatus: 'pending',
    });
    expect(JSON.parse(closedToolOutput).result).toEqual({
      question: QUESTIONS[0],
      status: 'skipped',
    });
  });

  it('tells open chat lists the conversation no longer waits on an answer', async () => {
    const { service, threadRecordEventService } = buildService();

    await service.closePendingToolCalls(closeArguments);

    expect(
      threadRecordEventService.emitPendingQuestionCleared,
    ).toHaveBeenCalledTimes(1);
    expect(
      threadRecordEventService.emitPendingQuestionCleared,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      messageId: 'question-message-id',
    });
  });

  it('leaves the call as it is when an answer holds the conversation', async () => {
    const { service, messagePartRepository, threadRecordEventService } =
      buildService({
        claimAffected: 0,
      });

    await service.closePendingToolCalls(closeArguments);

    expect(messagePartRepository.writePart).not.toHaveBeenCalled();
    expect(
      threadRecordEventService.emitPendingQuestionCleared,
    ).not.toHaveBeenCalled();
  });
});

describe('AgentChatService recordToolCallAnswer', () => {
  const answerArguments = {
    threadId: 'thread-id',
    messageId: 'question-message-id',
    partId: 'part-id',
    toolOutput: { result: { status: 'answered' } },
    workspaceId: 'workspace-id',
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
