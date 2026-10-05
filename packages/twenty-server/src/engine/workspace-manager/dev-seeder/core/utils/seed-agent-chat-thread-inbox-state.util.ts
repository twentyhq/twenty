import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { AGENT_CHAT_THREAD_LAST_MESSAGE_TEXT_MAX_LENGTH } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-last-message-text-max-length.constant';
import { buildAgentChatThreadParticipantOwnerShareInsert } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-participant-owner-share-insert.util';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';

// Seeded chats are inserted directly, so they get the last activity, last
// message and owner read state a chat created through the app starts with
export const seedAgentChatThreadInboxState = async ({
  context: { manager, table },
  workspaceId,
}: {
  context: AgentHistoryStorageContext;
  workspaceId: string;
}): Promise<void> => {
  await manager.query(
    `WITH activity AS (
       SELECT thread.id,
         COALESCE(last_message."createdAt", thread."createdAt") AS "lastActivityAt",
         left(last_text."textContent", ${AGENT_CHAT_THREAD_LAST_MESSAGE_TEXT_MAX_LENGTH}) AS "lastMessageText",
         last_message."senderWorkspaceMemberId",
         writer."workspaceMemberIds"
       FROM ${table('agentChatThread')} thread
       LEFT JOIN LATERAL (
         SELECT message.id, message."createdAt",
           CASE WHEN message.role = 'user'
             THEN COALESCE(message."senderWorkspaceMemberId", thread."workspaceMemberId")
           END AS "senderWorkspaceMemberId"
         FROM ${table('agentMessage')} message
         WHERE message."threadId" = thread.id
           AND message."deletedAt" IS NULL
           AND message."isHidden" = false
           AND message.role IN ('user', 'assistant')
         ORDER BY message."createdAt" DESC, message.id DESC
         LIMIT 1
       ) last_message ON true
       LEFT JOIN LATERAL (
         SELECT part."textContent"
         FROM ${table('agentMessagePart')} part
         WHERE part."messageId" = last_message.id
           AND part.type = 'text'
           AND btrim(coalesce(part."textContent", '')) <> ''
         ORDER BY part."orderIndex" DESC
         LIMIT 1
       ) last_text ON true
       LEFT JOIN LATERAL (
         SELECT array_agg(DISTINCT COALESCE(message."senderWorkspaceMemberId", thread."workspaceMemberId")::text)
           FILTER (WHERE COALESCE(message."senderWorkspaceMemberId", thread."workspaceMemberId") IS NOT NULL)
           AS "workspaceMemberIds"
         FROM ${table('agentMessage')} message
         WHERE message."threadId" = thread.id
           AND message."deletedAt" IS NULL
           AND message."isHidden" = false
           AND message.role = 'user'
       ) writer ON true
       WHERE thread."lastActivityAt" IS NULL
     )
     UPDATE ${table('agentChatThread')} thread
     SET "lastActivityAt" = activity."lastActivityAt",
       "lastMessageText" = activity."lastMessageText",
       "lastMessageSenderWorkspaceMemberId" = activity."senderWorkspaceMemberId",
       "writerWorkspaceMemberIds" = activity."workspaceMemberIds"
     FROM activity
     WHERE thread.id = activity.id`,
  );

  await manager.query(
    `INSERT INTO ${getAgentChatThreadParticipantTable(workspaceId)} ("threadId", "workspaceMemberId", "lastReadAt")
     SELECT thread.id, thread."workspaceMemberId", thread."lastActivityAt"
     FROM ${table('agentChatThread')} thread
     WHERE thread."workspaceMemberId" IS NOT NULL
     ON CONFLICT ("threadId", "workspaceMemberId") DO NOTHING`,
  );

  // Every row, so ones seeded by an earlier run are granted too
  await manager.query(
    buildAgentChatThreadParticipantOwnerShareInsert({
      workspaceId,
      participantSource: getAgentChatThreadParticipantTable(workspaceId),
      objectMetadataIdParameter: `(SELECT id FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "universalIdentifier" = $2)`,
    }),
    [
      workspaceId,
      STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier,
    ],
  );
};
