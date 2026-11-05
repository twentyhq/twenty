import { type EntityManager } from 'typeorm';

import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';

export type AgentHistoryStorageContext = {
  manager: EntityManager;
  table: (name: AgentHistoryObjectName) => string;
};
