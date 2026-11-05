import { type EntityManager } from 'typeorm';

import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { type AgentHistoryObjectMetadataMaps } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-metadata-maps.type';

export type AgentHistoryStorageContext = {
  manager: EntityManager;
  flatObjectMetadataMaps: AgentHistoryObjectMetadataMaps;
  table: (name: AgentHistoryObjectName) => string;
};
