import { AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participant-next-updated-at.constant';
import { type BuildAgentChatThreadParticipantWriteQuery } from 'src/engine/metadata-modules/ai/ai-chat/types/build-agent-chat-thread-participant-write-query.type';

export const buildAgentChatThreadAssigneeParticipantQuery: BuildAgentChatThreadParticipantWriteQuery =
  ({ participantTable, threadTable }) =>
    `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastReadAt")
     SELECT thread.id, $2, CASE WHEN $3::boolean THEN thread."lastActivityAt" END
     FROM ${threadTable} thread WHERE thread.id = $1
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "lastReadAt" = CASE WHEN $3::boolean THEN participant."lastReadAt" END,
       "archivedAt" = NULL,
       "snoozedUntil" = NULL,
       "isSubscribed" = true,
       "updatedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT}
     RETURNING *`;
