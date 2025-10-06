import { v4 } from 'uuid';

import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type StandardAgentDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/types/standard-agent-definition.interface';

export const transformStandardAgentDefinitionToFlatAgent = (
  standardAgentDefinition: StandardAgentDefinition,
  workspaceId: string,
): FlatAgent => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createHandoffFromDefaultAgent, standardRoleId, ...agentProps } =
    standardAgentDefinition;

  return {
    ...agentProps,
    id: v4(),
    workspaceId,
    universalIdentifier: standardAgentDefinition.standardId || v4(),
  };
};
