import { AGENT_CHAT_THREAD_LAST_MESSAGE_TEXT_MAX_LENGTH } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-last-message-text-max-length.constant';
import { buildAgentChatThreadLastMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-last-message-text.util';

describe('buildAgentChatThreadLastMessageText', () => {
  it('returns null for text that is only whitespace', () => {
    expect(buildAgentChatThreadLastMessageText('  \n ')).toBeNull();
  });

  it('trims the text', () => {
    expect(buildAgentChatThreadLastMessageText('  Deal won \n')).toBe(
      'Deal won',
    );
  });

  it('truncates without splitting a character', () => {
    const text = '🎉'.repeat(
      AGENT_CHAT_THREAD_LAST_MESSAGE_TEXT_MAX_LENGTH + 1,
    );

    expect(buildAgentChatThreadLastMessageText(text)).toBe(
      '🎉'.repeat(AGENT_CHAT_THREAD_LAST_MESSAGE_TEXT_MAX_LENGTH),
    );
  });
});
