import { isValidAgentMessageReactionEmoji } from '../is-valid-agent-message-reaction-emoji.util';

describe('isValidAgentMessageReactionEmoji', () => {
  it.each(['👍', '❤️', '🎉', '👍🏽', '👨‍👩‍👧‍👦', '🏳️‍🌈', '🇫🇷', '1️⃣'])(
    'should accept "%s"',
    (emoji) => {
      expect(isValidAgentMessageReactionEmoji(emoji)).toBe(true);
    },
  );

  it.each([
    ['an empty string', ''],
    ['plain text', 'ok'],
    ['a digit', '1'],
    ['an emoji followed by a space', '👍 '],
    ['two emojis split by a newline', '👍\n🎉'],
    ['over 32 characters', '👍'.repeat(17)],
  ])('should reject %s', (_label, emoji) => {
    expect(isValidAgentMessageReactionEmoji(emoji)).toBe(false);
  });
});
