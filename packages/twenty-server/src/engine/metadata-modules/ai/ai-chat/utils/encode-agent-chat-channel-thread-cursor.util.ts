import { type AgentChatChannelThreadCursor } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-thread-cursor.type';

export const encodeAgentChatChannelThreadCursor = (
  cursor: AgentChatChannelThreadCursor,
): string =>
  Buffer.from(
    JSON.stringify([cursor.lastActivityAt, cursor.id]),
    'utf8',
  ).toString('base64url');
