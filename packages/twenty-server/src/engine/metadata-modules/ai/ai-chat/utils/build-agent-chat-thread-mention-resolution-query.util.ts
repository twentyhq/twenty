import { AGENT_CHAT_HAS_UNRESOLVED_MENTION_PREDICATE } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-has-unresolved-mention-predicate.constant';
import { AGENT_CHAT_THREAD_PARTICIPANT_ALL_MENTIONS_RESOLVED_AT } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participant-all-mentions-resolved-at.constant';
import { AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participant-next-updated-at.constant';

export const buildAgentChatThreadMentionResolutionQuery = ({
  participantTable,
}: {
  participantTable: string;
}): string =>
  `UPDATE ${participantTable} AS participant
   SET "mentionsResolvedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_ALL_MENTIONS_RESOLVED_AT}, "updatedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT}
   WHERE "threadId" = $1 AND "workspaceMemberId" = $2
     AND ${AGENT_CHAT_HAS_UNRESOLVED_MENTION_PREDICATE}
   RETURNING *`;
