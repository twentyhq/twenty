import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';

// One statement, so a request that claims the thread right after cannot have
// its new turn ended. Parameters: thread id, stream id, then the status and
// error to end the running turn with, or null to leave it as is
export const buildReleaseStreamClaimQuery = ({
  table,
}: {
  table: (name: AgentHistoryObjectName) => string;
}): string =>
  `WITH released AS (
     UPDATE ${table('agentChatThread')} SET "activeStreamId" = NULL, "updatedAt" = now()
     WHERE id = $1 AND "activeStreamId" = $2
     RETURNING id
   ), ended AS (
     UPDATE ${table('agentTurn')} SET "status" = $3, "error" = $4::jsonb, "endedAt" = now(), "updatedAt" = now()
     WHERE $3::text IS NOT NULL AND "threadId" IN (SELECT id FROM released) AND "status" = '${AgentTurnStatus.RUNNING}'
     RETURNING id
   ) SELECT id FROM released`;
