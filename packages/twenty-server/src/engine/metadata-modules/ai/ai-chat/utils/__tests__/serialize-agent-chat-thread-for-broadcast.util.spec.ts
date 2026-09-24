import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { serializeAgentChatThreadForBroadcast } from 'src/engine/metadata-modules/ai/ai-chat/utils/serialize-agent-chat-thread-for-broadcast.util';

describe('Thread broadcasts', () => {
  it('contains thread data without viewer-specific permissions', () => {
    const thread = Object.assign(new AgentChatThreadEntity(), {
      id: 'thread',
      userWorkspaceId: 'owner',
      totalInputCredits: 0,
      totalOutputCredits: 0,
    });
    const broadcast = serializeAgentChatThreadForBroadcast({
      thread,
      lastMessageAt: null,
    });
    expect(broadcast).toMatchObject({ id: 'thread' });
    expect(broadcast).not.toHaveProperty('permissions');
  });
});
