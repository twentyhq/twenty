import { v4 } from 'uuid';

import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type StandardAgentDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/types/standard-agent-definition.interface';

export const transformStandardAgentDefinitionToFlatAgent = ({
  standardAgentDefinition: {
    description,
    icon,
    isCustom,
    label,
    modelConfiguration,
    modelId,
    name,
    prompt,
    responseFormat,
    standardId,
  },
  workspaceId,
  applicationId,
  agentId = v4(),
}: {
  standardAgentDefinition: StandardAgentDefinition;
  workspaceId: string;
  applicationId: string;
  agentId?: string;
}): FlatAgent => ({
  description,
  icon,
  isCustom,
  label,
  modelConfiguration,
  modelId,
  name,
  prompt,
  responseFormat,
  standardId,
  universalIdentifier: standardId,
  id: agentId,
  applicationId,
  workspaceId,
});
