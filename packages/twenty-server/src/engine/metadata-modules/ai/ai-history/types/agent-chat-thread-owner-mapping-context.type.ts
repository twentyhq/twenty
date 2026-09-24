import { type EntityManager } from 'typeorm';

import { type AgentChatThreadOwnerFields } from 'src/engine/metadata-modules/ai/ai-history/utils/get-agent-chat-thread-owner-fields.util';

export type AgentChatThreadOwnerMappingContext = {
  manager: Pick<EntityManager, 'query'>;
  workspaceId: string;
  ownerFields: AgentChatThreadOwnerFields;
};
