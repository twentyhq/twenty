import { v4 } from 'uuid';

import { type StandardAgentDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/types/standard-agent-definition.interface';
import { type FlatAgent } from '../types/flat-agent.type';

export const fromStandardAgentDefinitionToFlatAgent = (
  standardAgentDefinition: StandardAgentDefinition,
  workspaceId: string,
): FlatAgent => {
  return {
    ...standardAgentDefinition,
    id: v4(),
    workspaceId,
    uniqueIdentifier: standardAgentDefinition.standardId || v4(),
  };
};
