import { AGENT_MESSAGE_REACTION_EMOJI_MAX_LENGTH } from '@/ai/constants/agent-message-reaction-emoji-max-length.const';

const EMOJI_PATTERN = /\p{Extended_Pictographic}/u;
const WHITESPACE_PATTERN = /\s/u;

export const isValidAgentMessageReactionEmoji = (emoji: string): boolean =>
  emoji.length > 0 &&
  emoji.length <= AGENT_MESSAGE_REACTION_EMOJI_MAX_LENGTH &&
  EMOJI_PATTERN.test(emoji) &&
  !WHITESPACE_PATTERN.test(emoji);
