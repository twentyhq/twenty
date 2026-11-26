import { INBOX_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/inbox-object-names.constant';
import { LEGACY_INBOX_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/legacy-inbox-object-names.constant';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

it('reads native workspace fields and precision from workspace storage', async () => {
  const record = {
    id: 'thread',
    archivedAt: '2026-01-01T00:00:00.000Z',
    totalInputCredits: '9007199254740993',
    activeStreamId: '',
  };
  const storage = {
    run: jest.fn(),
    getContext: jest.fn().mockReturnValue({}),
  };
  const find = jest.fn().mockResolvedValue([record]);
  const count = jest.fn().mockResolvedValue(1);
  const orm = {
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation(async (work: () => Promise<unknown>) => work()),
    getRepositoryWithoutPermissionChecks: jest
      .fn()
      .mockReturnValue({ find, count }),
  };
  const repository = new AgentHistoryRepository<AgentChatThreadWorkspaceEntity>(
    'agentChatThread',
    storage,
    orm as never,
    { resolve: jest.fn().mockResolvedValue(LEGACY_INBOX_OBJECT_NAMES) },
  );
  await expect(
    repository.find('workspace', {
      where: { id: 'thread' },
      order: { archivedAt: { order: 'DESC', nulls: 'NULLS LAST' } },
    }),
  ).resolves.toEqual([record]);
  await expect(repository.count('workspace')).resolves.toBe(1);
  expect(find).toHaveBeenCalledWith(
    expect.objectContaining({
      order: { archivedAt: { order: 'DESC', nulls: 'NULLS LAST' } },
    }),
  );
  expect(storage.getContext).toHaveBeenCalledWith('workspace');
  expect(storage.getContext).toHaveBeenCalledTimes(2);
});

it('reads the object under the name resolved for the workspace', async () => {
  const orm = {
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation(async (work: () => Promise<unknown>) => work()),
    getRepositoryWithoutPermissionChecks: jest
      .fn()
      .mockReturnValue({ count: jest.fn().mockResolvedValue(0) }),
  };
  const repository = new AgentHistoryRepository<AgentChatThreadWorkspaceEntity>(
    'agentChatThread',
    { run: jest.fn(), getContext: jest.fn().mockResolvedValue({}) },
    orm,
    { resolve: jest.fn().mockResolvedValue(INBOX_OBJECT_NAMES) },
  );

  await repository.count('workspace');

  expect(orm.getRepositoryWithoutPermissionChecks).toHaveBeenCalledWith(
    'inboxThread',
    { shouldSkipEventEmission: true },
  );
});
