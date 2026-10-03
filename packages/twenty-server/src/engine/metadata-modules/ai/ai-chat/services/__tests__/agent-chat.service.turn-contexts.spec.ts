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
      { id: 'opening-turn', context: 'Company: Acme Inc' },
      { id: 'user-turn', context: null },
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

  return { service, turnRepository };
};

describe('AgentChatService getTurnContexts', () => {
  it('gives the thread owner the context of the turns the agent opened', async () => {
    const { service } = buildService();

    await expect(
      service.getTurnContexts({
        threadId: THREAD_ID,
        workspaceMemberId: OWNER_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toEqual(new Map([['opening-turn', 'Company: Acme Inc']]));
  });

  it('keeps the owner’s contexts from the turns of other participants', async () => {
    const { service, turnRepository } = buildService();

    await expect(
      service.getTurnContexts({
        threadId: THREAD_ID,
        workspaceMemberId: 'participant-member-id',
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toEqual(new Map());
    expect(turnRepository.find).not.toHaveBeenCalled();
  });
});
