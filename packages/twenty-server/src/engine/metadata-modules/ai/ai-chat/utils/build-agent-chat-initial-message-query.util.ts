import { doNotTranslate } from 'twenty-shared/i18n';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';

export const buildAgentChatInitialMessageQuery = ({
  messageTable,
  threadId,
  workspaceMemberId,
  messageId = null,
}: {
  messageTable: string;
  threadId: string;
  workspaceMemberId: string;
  messageId?: string | null;
}) => ({
  query: doNotTranslate(`WITH initial_message AS (
    SELECT id, role, "senderWorkspaceMemberId"
    FROM ${messageTable}
    WHERE "threadId" = $1 AND role <> $2
    ORDER BY "createdAt", id LIMIT 1
  )
  SELECT CASE WHEN $4::uuid IS NULL
    THEN NOT EXISTS (SELECT 1 FROM initial_message)
    ELSE EXISTS (
      SELECT 1 FROM initial_message
      WHERE id = $4 AND role = $3 AND "senderWorkspaceMemberId" = $5
    ) AND NOT EXISTS (
      SELECT 1 FROM ${messageTable}
      WHERE "threadId" = $1 AND role = $3 AND id <> $4
    )
  END AS "isInitialMessage"`),
  parameters: [
    threadId,
    AgentMessageRole.SYSTEM,
    AgentMessageRole.USER,
    messageId,
    workspaceMemberId,
  ],
});
