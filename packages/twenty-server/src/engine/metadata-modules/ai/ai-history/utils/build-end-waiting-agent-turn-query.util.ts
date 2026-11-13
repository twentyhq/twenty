import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';

// $1 is the question message id and $2 the status the turn ends with
export const buildEndWaitingAgentTurnQuery = ({
  table,
}: {
  table: (name: AgentHistoryObjectName) => string;
}): string =>
  `UPDATE ${table('agentTurn')} turn SET "status" = $2, "endedAt" = now(), "updatedAt" = now()
   FROM ${table('agentMessage')} message
   WHERE message.id = $1 AND turn.id = message."turnId" AND turn."status" = '${AgentTurnStatus.WAITING_FOR_INPUT}'`;
