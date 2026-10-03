import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const OWNER_ID = 'owner-member-id';

const buildService = () => {
  const threadRepository = {
    findOne: jest
      .fn()
      .mockResolvedValue({ id: THREAD_ID, workspaceMemberId: OWNER_ID }),
  };
  const turnRepository = {
    find: jest.fn().mockResolvedValue([
      {
        id: 'opening-turn',
        context: 'Company: Acme Inc',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'user-turn',
        context: null,
        createdAt: '2026-01-01T00:01:00.000Z',
      },
    ]),
  };

  const service = new AgentChatService(
    threadRepository as never,
    turnRepository as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  return { service, threadRepository, turnRepository };
};

describe('AgentChatService getTurnContexts', () => {
  it('gives the thread owner the context of the turns the agent opened', async () => {
    const { service, threadRepository, turnRepository } = buildService();

    await expect(
      service.getTurnContexts({
        threadId: THREAD_ID,
        workspaceMemberId: OWNER_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toEqual([
      {
        turnId: 'opening-turn',
        context: 'Company: Acme Inc',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    expect(threadRepository.findOne).toHaveBeenCalledWith(WORKSPACE_ID, {
      where: { id: THREAD_ID },
      select: ['id', 'workspaceMemberId'],
    });
    expect(turnRepository.find).toHaveBeenCalledWith(WORKSPACE_ID, {
      where: { threadId: THREAD_ID },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
  });

  it('keeps the owner’s contexts from the turns of other participants', async () => {
    const { service, turnRepository } = buildService();

    await expect(
      service.getTurnContexts({
        threadId: THREAD_ID,
        workspaceMemberId: 'participant-member-id',
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toEqual([]);
    expect(turnRepository.find).not.toHaveBeenCalled();
  });
});
