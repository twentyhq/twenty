import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { serializeAgentChatThreadForBroadcast } from 'src/engine/metadata-modules/ai/ai-chat/utils/serialize-agent-chat-thread-for-broadcast.util';

describe('Thread broadcasts', () => {
  it('contains thread data without viewer-specific permissions', () => {
    const thread = Object.assign(new AgentChatThreadWorkspaceEntity(), {
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
