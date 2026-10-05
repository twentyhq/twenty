// Parent-first order is also the durable migration cursor order. Append only.
export const AGENT_HISTORY_OBJECT_NAMES = [
  'agentChatThread',
  'agentTurn',
  'agentMessage',
  'agentMessagePart',
  'agentTurnEvaluation',
] as const;
