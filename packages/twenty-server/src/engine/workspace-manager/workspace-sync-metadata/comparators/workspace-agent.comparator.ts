import { Injectable } from '@nestjs/common';

import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';

import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

type AgentComparatorResult = {
  action:
    | ComparatorAction.CREATE
    | ComparatorAction.UPDATE
    | ComparatorAction.DELETE;
  object: FlatAgent;
};

@Injectable()
export class WorkspaceAgentComparator {
  compare({
    fromFlatAgents,
    toFlatAgents,
  }: {
    fromFlatAgents: FlatAgent[];
    toFlatAgents: FlatAgent[];
  }): AgentComparatorResult[] {
    const results: AgentComparatorResult[] = [];

    for (const toAgent of toFlatAgents) {
      const existingAgent = fromFlatAgents.find(
        (agent) => agent.uniqueIdentifier === toAgent.uniqueIdentifier,
      );

      if (!existingAgent) {
        results.push({
          action: ComparatorAction.CREATE,
          object: toAgent,
        });
      }
    }

    for (const fromAgent of fromFlatAgents) {
      const targetAgent = toFlatAgents.find(
        (agent) => agent.uniqueIdentifier === fromAgent.uniqueIdentifier,
      );

      if (targetAgent) {
        if (
          fromAgent.name !== targetAgent.name ||
          fromAgent.label !== targetAgent.label ||
          fromAgent.description !== targetAgent.description ||
          fromAgent.icon !== targetAgent.icon ||
          fromAgent.prompt !== targetAgent.prompt ||
          fromAgent.modelId !== targetAgent.modelId ||
          fromAgent.responseFormat !== targetAgent.responseFormat ||
          fromAgent.isCustom !== targetAgent.isCustom
        ) {
          results.push({
            action: ComparatorAction.UPDATE,
            object: {
              ...targetAgent,
              id: fromAgent.id,
            },
          });
        }
      } else {
        results.push({
          action: ComparatorAction.DELETE,
          object: fromAgent,
        });
      }
    }

    return results;
  }
}
