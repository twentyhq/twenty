import { AgentChatThreadConversationType } from '@/ai/types/AgentChatThreadConversationType';

import { isAgentChatThreadDirectAssistantChat } from '@/ai/utils/is-agent-chat-thread-direct-assistant-chat.util';

const OWNER_ID = '20202020-0687-4c41-b707-ed1bfca972a7';
const OTHER_MEMBER_ID = '20202020-77d5-4cb6-b60a-f4a835a85d61';

const DIRECT_ASSISTANT_CHAT = {
  conversationType: AgentChatThreadConversationType.STANDARD,
  isAssistantParticipant: true,
  channelId: null,
  workspaceMemberId: OWNER_ID,
  writerWorkspaceMemberIds: [OWNER_ID],
};

describe('isAgentChatThreadDirectAssistantChat', () => {
  it('accepts a chat between one member and the assistant', () => {
    expect(isAgentChatThreadDirectAssistantChat(DIRECT_ASSISTANT_CHAT)).toBe(
      true,
    );
  });

  it('accepts a chat nobody has written in yet', () => {
    expect(
      isAgentChatThreadDirectAssistantChat({
        ...DIRECT_ASSISTANT_CHAT,
        writerWorkspaceMemberIds: null,
      }),
    ).toBe(true);
  });

  it.each([
    ['a group chat', { writerWorkspaceMemberIds: [OWNER_ID, OTHER_MEMBER_ID] }],
    ['a channel chat', { channelId: '20202020-3b6c-4f0e-9d7b-1c2a3b4c5d6e' }],
    ['a chat without the assistant', { isAssistantParticipant: false }],
    [
      'a direct message',
      { conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE },
    ],
  ])('rejects %s', (_label, overrides) => {
    expect(
      isAgentChatThreadDirectAssistantChat({
        ...DIRECT_ASSISTANT_CHAT,
        ...overrides,
      }),
    ).toBe(false);
  });
});
