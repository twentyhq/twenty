import { AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participant-next-updated-at.constant';
import { buildAgentChatThreadParticipantWriteWithOwnerShareQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-participant-write-with-owner-share-query.util';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';

const NEXT_LAST_MENTIONED_AT = `GREATEST(
  EXCLUDED."lastMentionedAt",
  participant."lastMentionedAt" + interval '1 millisecond',
  participant."mentionsResolvedAt" + interval '1 millisecond'
)`;

export const buildAgentChatThreadMoveMembersToInboxQuery = ({
  workspaceId,
}: {
  workspaceId: string;
}): string =>
  buildAgentChatThreadParticipantWriteWithOwnerShareQuery({
    workspaceId,
    objectMetadataIdParameter: '$3',
    participantWriteQuery: `INSERT INTO ${getAgentChatThreadParticipantTable(workspaceId)} AS participant ("threadId", "workspaceMemberId", "lastMentionedAt")
     SELECT $1, member_id, CASE WHEN $4::boolean THEN clock_timestamp() END
     FROM unnest($2::uuid[]) member_id
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "lastReadAt" = NULL,
       "lastMentionedAt" = CASE WHEN $4::boolean THEN ${NEXT_LAST_MENTIONED_AT} ELSE participant."lastMentionedAt" END,
       "archivedAt" = NULL,
       "snoozedUntil" = NULL,
       "isSubscribed" = true,
       "updatedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT}
     RETURNING *`,
  });
