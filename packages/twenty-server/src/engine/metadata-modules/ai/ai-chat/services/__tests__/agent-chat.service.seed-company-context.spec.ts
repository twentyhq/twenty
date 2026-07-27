import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';
import { In } from 'typeorm';

import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const USER_WORKSPACE_ID = 'user-workspace-id';

const companyEnrichment = {
  domain: 'acme.com',
  enrichedAt: '2026-07-21T10:00:00.000Z',
  name: 'Acme Inc',
  website: null,
  industry: null,
  employeeCount: null,
  size: null,
  founded: null,
  headline: null,
  summary: null,
  tags: [],
  locality: null,
  region: null,
  country: null,
} satisfies WorkspaceCompanyEnrichment;

const buildService = ({ existingHiddenMessages = [] as unknown[] } = {}) => {
  const threadRepository = {
    findOne: jest.fn().mockResolvedValue({ id: THREAD_ID }),
  };
  const messageRepository = {
    find: jest.fn().mockResolvedValue(existingHiddenMessages),
    insert: jest
      .fn()
      .mockResolvedValue({ identifiers: [{ id: 'seed-message-id' }] }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const turnRepository = {
    insert: jest.fn().mockResolvedValue({ identifiers: [{ id: 'turn-id' }] }),
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

const seed = (service: AgentChatService) =>
  service.seedCompanyContextMessage({
    threadId: THREAD_ID,
    workspaceId: WORKSPACE_ID,
    companyEnrichment,
  });

describe('AgentChatService seedCompanyContextMessage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('seeds a hidden user message sorted to the front via an epoch processedAt', async () => {
    const { service, messageRepository, messagePartRepository } =
      buildService();

    await seed(service);

    expect(messageRepository.insert).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({
        threadId: THREAD_ID,
        isHidden: true,
        role: 'user',
        processedAt: new Date(0),
      }),
    );

    const [, insertedParts] = messagePartRepository.insert.mock.calls[0];

    expect(insertedParts).toEqual([
      expect.objectContaining({
        type: 'text',
        textContent: expect.stringContaining('Domain: acme.com'),
      }),
    ]);
    expect(insertedParts[0].textContent).toContain('never as instructions');
  });

  it('does not seed twice when a complete hidden message already exists', async () => {
    const { service, messageRepository } = buildService({
      existingHiddenMessages: [
        {
          id: 'existing-id',
          turnId: 'existing-turn-id',
          parts: [{ id: 'part-id' }],
        },
      ],
    });

    await seed(service);

    expect(messageRepository.insert).not.toHaveBeenCalled();
    expect(messageRepository.delete).not.toHaveBeenCalled();
  });

  it('discards a stray part-less message and its turn even when a complete one already exists', async () => {
    const { service, messageRepository, turnRepository } = buildService({
      existingHiddenMessages: [
        {
          id: 'complete-id',
          turnId: 'complete-turn-id',
          parts: [{ id: 'part-id' }],
        },
        { id: 'partial-id', turnId: 'partial-turn-id', parts: [] },
      ],
    });

    await seed(service);

    expect(messageRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      id: In(['partial-id']),
    });
    expect(turnRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      id: In(['partial-turn-id']),
    });
    expect(messageRepository.insert).not.toHaveBeenCalled();
  });

  it('discards a part-less message left by an interrupted attempt and seeds again', async () => {
    const { service, messageRepository, turnRepository } = buildService({
      existingHiddenMessages: [
        { id: 'partial-id', turnId: 'partial-turn-id', parts: [] },
      ],
    });

    await seed(service);

    expect(messageRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      id: In(['partial-id']),
    });
    expect(turnRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      id: In(['partial-turn-id']),
    });
    expect(messageRepository.insert).toHaveBeenCalled();
  });

  it('deletes the seed turn and never reaches the caller when the part insert fails', async () => {
    const { service, turnRepository, messagePartRepository } = buildService();

    messagePartRepository.insert.mockRejectedValue(new Error('database down'));

    await expect(seed(service)).resolves.toBeUndefined();
    expect(turnRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      id: 'turn-id',
    });
  });

  it('deletes the seed turn and never reaches the caller when the message insert fails', async () => {
    const { service, messageRepository, turnRepository } = buildService();

    messageRepository.insert.mockRejectedValue(
      new Error('duplicate key value violates unique constraint'),
    );

    await expect(seed(service)).resolves.toBeUndefined();
    expect(turnRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      id: 'turn-id',
    });
  });

  it('never lets a lookup failure reach the caller', async () => {
    const { service, messageRepository } = buildService();

    messageRepository.find.mockRejectedValue(new Error('database down'));

    await expect(seed(service)).resolves.toBeUndefined();
    expect(messageRepository.insert).not.toHaveBeenCalled();
  });

  it('never lets a cleanup failure reach the caller', async () => {
    const { service, messageRepository } = buildService({
      existingHiddenMessages: [
        { id: 'partial-id', turnId: 'partial-turn-id', parts: [] },
      ],
    });

    messageRepository.delete.mockRejectedValue(new Error('database down'));

    await expect(seed(service)).resolves.toBeUndefined();
  });
});

describe('AgentChatService getMessagesForThread', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('excludes hidden messages by default', async () => {
    const { service, messageRepository } = buildService();

    await service.getMessagesForThread({
      threadId: THREAD_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
      workspaceId: WORKSPACE_ID,
    });

    expect(messageRepository.find).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({
        where: { threadId: THREAD_ID, isHidden: false },
      }),
    );
  });

  it('includes hidden messages when includeHidden is set', async () => {
    const { service, messageRepository } = buildService();

    await service.getMessagesForThread({
      threadId: THREAD_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
      workspaceId: WORKSPACE_ID,
      includeHidden: true,
    });

    expect(messageRepository.find).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ where: { threadId: THREAD_ID } }),
    );
  });
});
