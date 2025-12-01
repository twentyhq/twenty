import { Injectable } from '@nestjs/common';

import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { transformStandardAgentDefinitionToFlatAgent } from 'src/engine/metadata-modules/flat-agent/utils/transform-standard-agent-definition-to-flat-agent.util';
import { type StandardAgentDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/types/standard-agent-definition.interface';

@Injectable()
export class StandardAgentFactory {
  create(
    agentDefinitions: StandardAgentDefinition[],
    context: WorkspaceSyncContext,
    existingAgents: AgentEntity[],
  ): FlatAgent[] {
    const computedAgents: FlatAgent[] = [];

    for (const agentDefinition of agentDefinitions) {
      const existingAgent = existingAgents.find(
        (agent) => agent.standardId === agentDefinition.standardId,
      );

      const flatAgent = transformStandardAgentDefinitionToFlatAgent(
        agentDefinition,
        context.workspaceId,
      );

      if (existingAgent) {
        computedAgents.push({
          ...flatAgent,
          id: existingAgent.id,
          universalIdentifier: agentDefinition.standardId,
        });
      } else {
        computedAgents.push({
          ...flatAgent,
          universalIdentifier: agentDefinition.standardId,
        });
      }
    }

    return computedAgents;
  }
}
