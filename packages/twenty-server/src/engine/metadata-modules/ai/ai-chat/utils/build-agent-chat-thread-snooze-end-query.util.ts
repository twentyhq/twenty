import { AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participant-next-updated-at.constant';
import { type BuildAgentChatThreadParticipantWriteQuery } from 'src/engine/metadata-modules/ai/ai-chat/types/build-agent-chat-thread-participant-write-query.type';

export const buildAgentChatThreadSnoozeEndQuery: BuildAgentChatThreadParticipantWriteQuery =
  ({ participantTable }) =>
    `UPDATE ${participantTable} AS participant
     SET "archivedAt" = NULL, "updatedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT}
     WHERE "threadId" = $1 AND "workspaceMemberId" = $2
       AND "snoozedUntil" = $3 AND "archivedAt" IS NOT NULL
     RETURNING *`;
