import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

export const isAgentTurnStatusFinal = (status: AgentTurnStatus): boolean =>
  status === AgentTurnStatus.COMPLETED ||
  status === AgentTurnStatus.CANCELLED ||
  status === AgentTurnStatus.FAILED;
