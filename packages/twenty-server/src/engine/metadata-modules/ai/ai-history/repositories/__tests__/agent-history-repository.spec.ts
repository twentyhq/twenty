import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

it('reads native workspace fields and precision behind the upgrade readiness fence', async () => {
  const record = {
    id: 'thread',
    archivedAt: '2026-01-01T00:00:00.000Z',
    totalInputCredits: '9007199254740993',
    activeStreamId: '',
  };
  const storage = {
    run: jest
      .fn()
      .mockImplementation(
        async (_workspaceId: string, work: () => Promise<unknown>) => work(),
      ),
  };
  const find = jest.fn().mockResolvedValue([record]);
  const count = jest.fn().mockResolvedValue(1);
  const orm = {
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation(async (work: () => Promise<unknown>) => work()),
    getRepository: jest.fn().mockReturnValue({ find, count }),
  };
  const repository = new AgentHistoryRepository<AgentChatThreadWorkspaceEntity>(
    'agentChatThread',
    storage,
    orm as never,
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
  expect(storage.run).toHaveBeenCalledTimes(2);
});
