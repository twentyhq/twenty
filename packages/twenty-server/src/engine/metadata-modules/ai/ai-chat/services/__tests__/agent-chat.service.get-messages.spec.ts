import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const USER_WORKSPACE_ID = 'user-workspace-id';

const buildService = () => {
  const threadRepository = {
    findOne: jest.fn().mockResolvedValue({ id: THREAD_ID }),
  };
  const messageRepository = { find: jest.fn().mockResolvedValue([]) };

  const service = new AgentChatService(
    threadRepository as never,
    {} as never,
    messageRepository as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {
      onThreadCreated: jest.fn(),
      onTurnCompleted: jest.fn(),
      onQuestionAnswered: jest.fn(),
      onThreadRemoved: jest.fn(),
    } as never,
  );

  return { service, messageRepository };
};

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
