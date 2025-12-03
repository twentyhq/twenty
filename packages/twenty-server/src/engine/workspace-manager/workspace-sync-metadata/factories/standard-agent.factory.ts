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

    for (const standardAgentDefinition of agentDefinitions) {
      const existingAgentEntity = existingAgents.find(
        (agent) => agent.standardId === standardAgentDefinition.standardId,
      );

      const flatAgent = transformStandardAgentDefinitionToFlatAgent({
        standardAgentDefinition,
        workspaceId: context.workspaceId,
        existingAgentEntity,
      });

      computedAgents.push(flatAgent);
    }

    return computedAgents;
  }
}
