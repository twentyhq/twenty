import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';

// One statement, so a request that claims the thread right after cannot have
// its new turn ended. Parameters: thread id, stream id, then the status and
// error to end the running turn with, or null to leave it as is. Without the
// 2.46 agentTurn run fields there is no turn status to end, so only the
// thread is released and the query takes the first two parameters
export const buildReleaseStreamClaimQuery = ({
  table,
  hasAgentTurnRunFields,
}: {
  table: (name: AgentHistoryObjectName) => string;
  hasAgentTurnRunFields: boolean;
}): string =>
  hasAgentTurnRunFields
    ? `WITH released AS (
     UPDATE ${table('agentChatThread')} SET "activeStreamId" = NULL, "updatedAt" = now()
     WHERE id = $1 AND "activeStreamId" = $2
     RETURNING *
   ), ended AS (
     UPDATE ${table('agentTurn')} SET "status" = $3, "error" = $4::jsonb, "endedAt" = now(), "updatedAt" = now()
     WHERE $3::text IS NOT NULL AND "threadId" IN (SELECT id FROM released) AND "status" = '${AgentTurnStatus.RUNNING}'
     RETURNING id
   ) SELECT * FROM released`
    : `WITH released AS (
     UPDATE ${table('agentChatThread')} SET "activeStreamId" = NULL, "updatedAt" = now()
     WHERE id = $1 AND "activeStreamId" = $2
     RETURNING *
   ) SELECT * FROM released`;
