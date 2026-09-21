import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { serializeAgentChatThreadForBroadcast } from 'src/engine/metadata-modules/ai/ai-chat/utils/serialize-agent-chat-thread-for-broadcast.util';

describe('Thread broadcast permissions', () => {
  it.each([
    ['owner', true],
    ['viewer', false],
  ])('derives management for recipient %s', (recipient, canManage) => {
    const thread = Object.assign(new AgentChatThreadEntity(), {
      id: 'thread',
      userWorkspaceId: 'owner',
      totalInputCredits: 0,
      totalOutputCredits: 0,
    });
    expect(
      serializeAgentChatThreadForBroadcast({
        thread,
        lastMessageAt: null,
        recipientUserWorkspaceId: String(recipient),
      }),
    ).toMatchObject({ id: 'thread', canManage });
  });
});
