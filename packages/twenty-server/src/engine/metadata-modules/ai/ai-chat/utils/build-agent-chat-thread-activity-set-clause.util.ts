import { AGENT_CHAT_THREAD_LAST_MESSAGE_TEXT_MAX_LENGTH } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-last-message-text-max-length.constant';

export const buildAgentChatThreadActivitySetClause = ({
  textParameter,
  senderWorkspaceMemberIdParameter = 'NULL',
}: {
  textParameter: string;
  senderWorkspaceMemberIdParameter?: string;
}) =>
  `"lastActivityAt" = clock_timestamp(),
   "lastMessageText" = left(NULLIF(btrim(${textParameter}), ''), ${AGENT_CHAT_THREAD_LAST_MESSAGE_TEXT_MAX_LENGTH}),
   "lastMessageSenderWorkspaceMemberId" = ${senderWorkspaceMemberIdParameter}`;
