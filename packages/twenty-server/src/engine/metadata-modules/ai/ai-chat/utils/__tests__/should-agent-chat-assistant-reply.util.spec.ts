import { shouldAgentChatAssistantReply } from 'src/engine/metadata-modules/ai/ai-chat/utils/should-agent-chat-assistant-reply.util';

const groupChat = {
  isInboxEnabled: true,
  isAssistantMentioned: false,
  isAwaitingAssistantQuestion: false,
  memberCount: 2,
};

describe('shouldAgentChatAssistantReply', () => {
  it('stays out of a conversation between people', () => {
    expect(shouldAgentChatAssistantReply(groupChat)).toBe(false);
  });

  it('answers when mentioned', () => {
    expect(
      shouldAgentChatAssistantReply({
        ...groupChat,
        isAssistantMentioned: true,
      }),
    ).toBe(true);
  });

  it('answers a reply to its own question', () => {
    expect(
      shouldAgentChatAssistantReply({
        ...groupChat,
        isAwaitingAssistantQuestion: true,
      }),
    ).toBe(true);
  });

  it('always answers a single member', () => {
    expect(
      shouldAgentChatAssistantReply({ ...groupChat, memberCount: 1 }),
    ).toBe(true);
  });

  it('always answers without the inbox', () => {
    expect(
      shouldAgentChatAssistantReply({ ...groupChat, isInboxEnabled: false }),
    ).toBe(true);
  });
});
