import { AGENT_CHAT_THREAD_ACTIVITY_COLUMNS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-activity-columns.constant';
import { AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participant-next-updated-at.constant';
import { buildAgentChatThreadActivitySetClause } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-activity-set-clause.util';
import { buildAgentChatThreadParticipantOwnerShareInsert } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-participant-owner-share-insert.util';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';

export const buildAgentChatThreadMemberActivityQuery = ({
  workspaceId,
  threadTable,
}: {
  workspaceId: string;
  threadTable: string;
}): string =>
  `WITH thread AS (
     UPDATE ${threadTable}
     SET "updatedAt" = now(),
       ${buildAgentChatThreadActivitySetClause({ textParameter: '$3', senderWorkspaceMemberIdParameter: '$2::uuid' })},
       "writerWorkspaceMemberIds" = CASE
         WHEN $2::uuid::text = ANY(COALESCE("writerWorkspaceMemberIds", '{}')) THEN "writerWorkspaceMemberIds"
         ELSE array_append(COALESCE("writerWorkspaceMemberIds", '{}'), $2::uuid::text)
       END
     WHERE id = $1
     RETURNING id, ${AGENT_CHAT_THREAD_ACTIVITY_COLUMNS}
   ), participant AS (
     INSERT INTO ${getAgentChatThreadParticipantTable(workspaceId)} AS participant ("threadId", "workspaceMemberId", "lastReadAt")
     SELECT thread.id, $2, thread."lastActivityAt" FROM thread
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "lastReadAt" = GREATEST(participant."lastReadAt", EXCLUDED."lastReadAt"),
       "archivedAt" = NULL,
       "snoozedUntil" = NULL,
       "isSubscribed" = true,
       "updatedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT}
     RETURNING id, "workspaceMemberId"
   ), owner_share AS (
     ${buildAgentChatThreadParticipantOwnerShareInsert({ workspaceId, participantSource: 'participant', objectMetadataIdParameter: '$4' })}
   )
   SELECT ${AGENT_CHAT_THREAD_ACTIVITY_COLUMNS} FROM thread`;
