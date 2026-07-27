import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';

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
  const messageRepository = {
    find: jest.fn().mockResolvedValue(existingHiddenMessages),
    insert: jest
      .fn()
      .mockResolvedValue({ identifiers: [{ id: 'seed-message-id' }] }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const turnRepository = {
    insert: jest.fn().mockResolvedValue({ identifiers: [{ id: 'turn-id' }] }),
  };
  const messagePartRepository = { insert: jest.fn().mockResolvedValue({}) };

  const service = new AgentChatService(
    {} as never,
    turnRepository as never,
    messageRepository as never,
    messagePartRepository as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  return { service, messageRepository, messagePartRepository };
};

const seed = (service: AgentChatService) =>
  service.seedCompanyContextMessage({
    threadId: THREAD_ID,
    workspaceId: WORKSPACE_ID,
    companyEnrichment,
    isHidden: true,
  });

describe('AgentChatService seedCompanyContextMessage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('seeds a hidden message with its context parts on a thread without one', async () => {
    const { service, messageRepository, messagePartRepository } =
      buildService();

    await seed(service);

    expect(messageRepository.insert).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ threadId: THREAD_ID, isHidden: true }),
    );
    expect(messagePartRepository.insert).toHaveBeenCalled();
  });

  it('does not seed twice when a complete hidden message already exists', async () => {
    const { service, messageRepository } = buildService({
      existingHiddenMessages: [
        { id: 'existing-id', parts: [{ id: 'part-id' }] },
      ],
    });

    await seed(service);

    expect(messageRepository.insert).not.toHaveBeenCalled();
    expect(messageRepository.delete).not.toHaveBeenCalled();
  });

  it('discards a part-less message left by an interrupted attempt and seeds again', async () => {
    const { service, messageRepository } = buildService({
      existingHiddenMessages: [{ id: 'partial-id', parts: [] }],
    });

    await seed(service);

    expect(messageRepository.delete).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ id: expect.anything() }),
    );
    expect(messageRepository.insert).toHaveBeenCalled();
  });

  it('never lets a seeding failure reach the caller', async () => {
    const { service, messagePartRepository } = buildService();

    messagePartRepository.insert.mockRejectedValue(new Error('database down'));

    await expect(seed(service)).resolves.toBeUndefined();
  });
});
