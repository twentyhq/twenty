import { In } from 'typeorm';

import {
  AgentMessageRole,
  AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const KICKOFF_TEXT = 'kickoff prompt text';

const buildService = ({ existingHiddenMessages = [] as unknown[] } = {}) => {
  const threadRepository = {
    findOne: jest.fn().mockResolvedValue({ id: THREAD_ID }),
  };
  const messageRepository = {
    find: jest.fn().mockResolvedValue(existingHiddenMessages),
    findOne: jest.fn().mockResolvedValue(null),
    insert: jest
      .fn()
      .mockResolvedValue({ identifiers: [{ id: 'kickoff-message-id' }] }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const turnRepository = {
    insert: jest
      .fn()
      .mockResolvedValue({ identifiers: [{ id: 'kickoff-turn-id' }] }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const messagePartRepository = { insert: jest.fn().mockResolvedValue({}) };

  const service = new AgentChatService(
    threadRepository as never,
    turnRepository as never,
    messageRepository as never,
    messagePartRepository as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  return { service, messageRepository, turnRepository, messagePartRepository };
};

const ensureKickoff = (service: AgentChatService) =>
  service.ensureHiddenKickoffMessage({
    threadId: THREAD_ID,
    workspaceId: WORKSPACE_ID,
    text: KICKOFF_TEXT,
  });

describe('AgentChatService ensureHiddenKickoffMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete part-less hidden rows and their orphan turns then insert a fresh hidden kickoff message when only partial rows exist', async () => {
    const {
      service,
      messageRepository,
      turnRepository,
      messagePartRepository,
    } = buildService({
      existingHiddenMessages: [
        { id: 'partial-id', turnId: 'partial-turn-id', parts: [] },
      ],
    });

    const result = await ensureKickoff(service);

    expect(messageRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      id: In(['partial-id']),
    });
    expect(turnRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      id: In(['partial-turn-id']),
    });

    expect(turnRepository.insert).toHaveBeenCalledWith(WORKSPACE_ID, {
      threadId: THREAD_ID,
      agentId: null,
    });
    expect(messageRepository.insert).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({
        threadId: THREAD_ID,
        turnId: 'kickoff-turn-id',
        role: AgentMessageRole.USER,
        isHidden: true,
      }),
    );

    const [, insertedMessage] = messageRepository.insert.mock.calls[0];

    expect(insertedMessage.processedAt).toBeInstanceOf(Date);
    expect(insertedMessage.processedAt.getTime()).toBeGreaterThan(0);
    expect(insertedMessage.processedAt).not.toEqual(new Date(0));

    const [, insertedParts] = messagePartRepository.insert.mock.calls[0];

    expect(insertedParts).toEqual([
      expect.objectContaining({ type: 'text', textContent: KICKOFF_TEXT }),
    ]);

    expect(result).toEqual({
      id: 'kickoff-message-id',
      turnId: 'kickoff-turn-id',
    });
  });

  it('should reuse the existing hidden message when one with parts already exists', async () => {
    const { service, messageRepository, turnRepository } = buildService({
      existingHiddenMessages: [
        {
          id: 'existing-id',
          turnId: 'existing-turn-id',
          parts: [{ id: 'part-id' }],
        },
      ],
    });

    const result = await ensureKickoff(service);

    expect(result).toEqual({ id: 'existing-id', turnId: 'existing-turn-id' });
    expect(turnRepository.insert).not.toHaveBeenCalled();
    expect(messageRepository.insert).not.toHaveBeenCalled();
  });

  it('should delete the created turn and rethrow when the message insert fails', async () => {
    const { service, messageRepository, turnRepository } = buildService();

    messageRepository.insert.mockRejectedValue(
      new Error('duplicate key value violates unique constraint'),
    );

    await expect(ensureKickoff(service)).rejects.toThrow(
      'duplicate key value violates unique constraint',
    );
    expect(turnRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      id: 'kickoff-turn-id',
    });
  });
});

describe('AgentChatService findLatestSentUserMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should look up sent user messages without an isHidden predicate and order by processedAt then createdAt then id when finding the latest sent message', async () => {
    const { service, messageRepository } = buildService();

    await service.findLatestSentUserMessage({
      threadId: THREAD_ID,
      workspaceId: WORKSPACE_ID,
    });

    expect(messageRepository.findOne).toHaveBeenCalledWith(WORKSPACE_ID, {
      where: {
        threadId: THREAD_ID,
        role: AgentMessageRole.USER,
        status: AgentMessageStatus.SENT,
      },
      order: {
        processedAt: { direction: 'DESC', nulls: 'LAST' },
        createdAt: 'DESC',
        id: 'DESC',
      },
      select: ['id', 'turnId'],
    });

    const [, findOneOptions] = messageRepository.findOne.mock.calls[0];

    expect(findOneOptions.where).not.toHaveProperty('isHidden');
  });
});

describe('AgentChatService hasConversationMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when a visible message exists', async () => {
    const { service, messageRepository } = buildService();

    messageRepository.findOne.mockResolvedValue({ id: 'visible-message-id' });

    await expect(
      service.hasConversationMessages({
        threadId: THREAD_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe(true);

    expect(messageRepository.findOne).toHaveBeenCalledWith(WORKSPACE_ID, {
      where: { threadId: THREAD_ID, isHidden: false },
      select: ['id'],
    });
  });

  it('should return false when no visible message exists', async () => {
    const { service, messageRepository } = buildService();

    messageRepository.findOne.mockResolvedValue(null);

    await expect(
      service.hasConversationMessages({
        threadId: THREAD_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe(false);
  });
});
