import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';

// Seeded chats are inserted directly, so they get the last activity and owner
// read state a chat created through the app starts with
export const seedAgentChatThreadInboxState = async ({
  context: { manager, table },
  workspaceId,
}: {
  context: AgentHistoryStorageContext;
  workspaceId: string;
}): Promise<void> => {
  await manager.query(
    `UPDATE ${table('agentChatThread')} thread
     SET "lastActivityAt" = COALESCE(
       (
         SELECT max(message."createdAt")
         FROM ${table('agentMessage')} message
         WHERE message."threadId" = thread.id
           AND message."isHidden" = false
           AND message.role IN ('user', 'assistant')
       ),
       thread."createdAt"
     )
     WHERE thread."lastActivityAt" IS NULL`,
  );

  await manager.query(
    `INSERT INTO ${getAgentChatThreadParticipantTable(workspaceId)} ("threadId", "workspaceMemberId", "lastReadAt")
     SELECT thread.id, thread."workspaceMemberId", thread."lastActivityAt"
     FROM ${table('agentChatThread')} thread
     WHERE thread."workspaceMemberId" IS NOT NULL
     ON CONFLICT ("threadId", "workspaceMemberId") DO NOTHING`,
  );
};
