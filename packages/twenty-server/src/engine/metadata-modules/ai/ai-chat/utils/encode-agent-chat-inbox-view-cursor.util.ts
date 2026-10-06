import { type AgentChatInboxViewCursor } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-inbox-view-cursor.type';

export const encodeAgentChatInboxViewCursor = (
  cursor: AgentChatInboxViewCursor,
): string =>
  Buffer.from(
    JSON.stringify([cursor.lastActivityAt, cursor.id]),
    'utf8',
  ).toString('base64url');
