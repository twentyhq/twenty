import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';
import { IsNull } from 'typeorm';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

describe('AgentChatService resolvePendingQuestion', () => {
  const pendingPart = {
    id: 'part-id',
    toolName: ASK_QUESTIONS_TOOL_NAME,
    toolOutput: {
      result: {
        status: 'pending',
        questions: [
          {
            header: 'Choice',
            question: 'Pick one',
            options: [{ label: 'Option A' }, { label: 'Option B' }],
          },
        ],
      },
    },
  };

  const questionMessage = {
    id: 'question-message-id',
    turnId: 'turn-id',
    parts: [pendingPart],
  };

  const buildService = ({
    message = questionMessage,
    claimAffected = 1,
    latestAssistantMessageId = 'question-message-id',
    orphanClaimAffected = 1,
  }: {
    message?: typeof questionMessage | null;
    claimAffected?: number;
    latestAssistantMessageId?: string;
    orphanClaimAffected?: number;
  } = {}) => {
    const threadRepository = {
      update: jest
        .fn()
        .mockImplementation((_workspaceId, criteria) =>
          Promise.resolve({
            affected:
              criteria.pendingQuestionMessageId === 'question-message-id'
                ? claimAffected
                : orphanClaimAffected,
          }),
        ),
    };
    const messageRepository = {
      findOne: jest
        .fn()
        .mockImplementation((_workspaceId, options) =>
          Promise.resolve(
            options.relations
              ? message
              : { id: latestAssistantMessageId },
          ),
        ),
    };
    const messagePartRepository = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const service = new AgentChatService(
      threadRepository as never,
      { insert: jest.fn() } as never,
      messageRepository as never,
      messagePartRepository as never,
      { find: jest.fn() } as never,
      {} as never,
      {} as never,
      {} as never,
    );

    return { service, threadRepository, messageRepository };
  };

  const resolveArguments = {
    threadId: 'thread-id',
    messageId: 'question-message-id',
    answers: [{ questionIndex: 0, selectedOptionIndices: [0] }],
    streamId: 'stream-id',
    workspaceId: 'workspace-id',
  };

  it('claims the registered pending question and returns the turn', async () => {
    const { service, threadRepository } = buildService();

    const result = await service.resolvePendingQuestion(resolveArguments);

    expect(result.turnId).toBe('turn-id');
    expect(threadRepository.update).toHaveBeenCalledWith(
      'workspace-id',
      {
        id: 'thread-id',
        pendingQuestionMessageId: 'question-message-id',
      },
      { pendingQuestionMessageId: null, activeStreamId: 'stream-id' },
    );
  });

  it('adopts an orphaned question when the thread never registered it', async () => {
    const { service, threadRepository } = buildService({ claimAffected: 0 });

    const result = await service.resolvePendingQuestion(resolveArguments);

    expect(result.turnId).toBe('turn-id');
    expect(threadRepository.update).toHaveBeenLastCalledWith(
      'workspace-id',
      {
        id: 'thread-id',
        pendingQuestionMessageId: IsNull(),
        activeStreamId: IsNull(),
      },
      { activeStreamId: 'stream-id' },
    );
  });

  it('rejects an orphaned question that is not the latest assistant message', async () => {
    const { service } = buildService({
      claimAffected: 0,
      latestAssistantMessageId: 'newer-message-id',
    });

    await expect(
      service.resolvePendingQuestion(resolveArguments),
    ).rejects.toThrow(
      new AiException(
        'No pending question to answer',
        AiExceptionCode.QUESTION_NOT_PENDING,
      ),
    );
  });

  it('rejects an orphaned question while another stream holds the thread', async () => {
    const { service } = buildService({
      claimAffected: 0,
      orphanClaimAffected: 0,
    });

    await expect(
      service.resolvePendingQuestion(resolveArguments),
    ).rejects.toThrow(
      new AiException(
        'No pending question to answer',
        AiExceptionCode.QUESTION_NOT_PENDING,
      ),
    );
  });

  it('rejects when the question part is already answered', async () => {
    const { service } = buildService({
      message: {
        ...questionMessage,
        parts: [
          {
            ...pendingPart,
            toolOutput: {
              result: { status: 'answered', questions: [] },
            },
          },
        ],
      },
    });

    await expect(
      service.resolvePendingQuestion(resolveArguments),
    ).rejects.toThrow(
      new AiException(
        'No pending question to answer',
        AiExceptionCode.QUESTION_NOT_PENDING,
      ),
    );
  });
});
