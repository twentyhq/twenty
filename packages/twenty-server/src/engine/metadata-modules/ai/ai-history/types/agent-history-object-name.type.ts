import { type AGENT_HISTORY_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-object-names.constant';

export type AgentHistoryObjectName =
  (typeof AGENT_HISTORY_OBJECT_NAMES)[number];
