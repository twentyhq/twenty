import { type AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

export const transformAgentEntityToFlatAgent = (
  agentEntity: AgentEntity,
): FlatAgent => {
  return {
    id: agentEntity.id,
    standardId: agentEntity.standardId,
    name: agentEntity.name,
    label: agentEntity.label,
    icon: agentEntity.icon,
    description: agentEntity.description,
    prompt: agentEntity.prompt,
    modelId: agentEntity.modelId,
    responseFormat: agentEntity.responseFormat,
    workspaceId: agentEntity.workspaceId,
    isCustom: agentEntity.isCustom,
    universalIdentifier: agentEntity.standardId || agentEntity.id,
    applicationId: agentEntity.applicationId,
  };
};
