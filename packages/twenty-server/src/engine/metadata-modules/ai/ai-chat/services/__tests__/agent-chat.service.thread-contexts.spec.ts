import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const OWNER_ID = 'owner-member-id';

const buildService = () => {
  const threadRepository = {
    findOne: jest
      .fn()
      .mockResolvedValue({ id: THREAD_ID, workspaceMemberId: OWNER_ID }),
  };
  const messageRepository = {
    find: jest.fn().mockResolvedValue([
      {
        id: 'context-message',
        parts: [
          { orderIndex: 1, textContent: 'The user locale is French.' },
          { orderIndex: 0, textContent: 'Company: Acme Inc' },
        ],
      },
      { id: 'interrupted-context-message', parts: [] },
    ]),
  };

  const service = new AgentChatService(
    threadRepository as never,
    {} as never,
    messageRepository as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  return { service, threadRepository, messageRepository };
};

describe('AgentChatService getThreadContexts', () => {
  it('gives the thread owner the text of its system and not yet upgraded hidden messages', async () => {
    const { service, threadRepository, messageRepository } = buildService();

    await expect(
      service.getThreadContexts({
        threadId: THREAD_ID,
        workspaceMemberId: OWNER_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toEqual(['Company: Acme Inc\n\nThe user locale is French.']);
    expect(threadRepository.findOne).toHaveBeenCalledWith(WORKSPACE_ID, {
      where: { id: THREAD_ID },
      select: ['id', 'workspaceMemberId'],
    });
    expect(messageRepository.find).toHaveBeenCalledWith(WORKSPACE_ID, {
      where: [
        { threadId: THREAD_ID, role: AgentMessageRole.SYSTEM },
        { threadId: THREAD_ID, isHidden: true },
      ],
      order: { createdAt: 'ASC', id: 'ASC' },
      relations: ['parts'],
    });
  });

  it('keeps the owner’s contexts from the turns of other participants', async () => {
    const { service, messageRepository } = buildService();

    await expect(
      service.getThreadContexts({
        threadId: THREAD_ID,
        workspaceMemberId: 'participant-member-id',
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toEqual([]);
    expect(messageRepository.find).not.toHaveBeenCalled();
  });
});
