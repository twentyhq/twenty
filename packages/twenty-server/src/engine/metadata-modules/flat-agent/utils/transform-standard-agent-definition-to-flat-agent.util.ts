import { v4 } from 'uuid';

import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type StandardAgentDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/types/standard-agent-definition.interface';

export const transformStandardAgentDefinitionToFlatAgent = ({
  standardAgentDefinition,
  workspaceId,
  existingAgentEntity,
}: {
  standardAgentDefinition: StandardAgentDefinition;
  workspaceId: string;
  existingAgentEntity?: Pick<
    AgentEntity,
    'createdAt' | 'deletedAt' | 'updatedAt' | 'id'
  >;
}): FlatAgent => {
  const {
    standardRoleId: _standardRoleId,
    outputStrategy: _outputStrategy,
    ...agentData
  } = standardAgentDefinition;
  const createdAt = new Date();

  return {
    id: existingAgentEntity?.id ?? v4(),
    createdAt: existingAgentEntity?.createdAt ?? createdAt,
    updatedAt: existingAgentEntity?.updatedAt ?? createdAt,
    deletedAt: existingAgentEntity?.deletedAt ?? null,
    ...agentData,
    workspaceId,
    universalIdentifier: standardAgentDefinition.standardId,
  };
};
