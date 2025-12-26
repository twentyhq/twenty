import { Injectable } from '@nestjs/common';

import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';

import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';

import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type AgentComparatorResult = {
  action:
    | ComparatorAction.CREATE
    | ComparatorAction.UPDATE
    | ComparatorAction.DELETE;
  object: FlatAgent;
};

type WorkspaceAgentComparatorArgs = FromTo<FlatAgent[], 'FlatAgents'>;

const agentPropertiesToIgnore = [
  'id',
  'createdAt',
  'updatedAt',
  'workspaceId',
  'universalIdentifier',
  'applicationId',
];

@Injectable()
export class WorkspaceAgentComparator {
  compare({
    fromFlatAgents,
    toFlatAgents,
  }: WorkspaceAgentComparatorArgs): AgentComparatorResult[] {
    const results: AgentComparatorResult[] = [];

    const keyFactory = (agent: FlatAgent) => agent.universalIdentifier ?? '';

    const fromAgentMap = transformMetadataForComparison(fromFlatAgents, {
      shouldIgnoreProperty: (property) =>
        agentPropertiesToIgnore.includes(property),
      keyFactory,
    });

    const toAgentMap = transformMetadataForComparison(toFlatAgents, {
      shouldIgnoreProperty: (property) =>
        agentPropertiesToIgnore.includes(property),
      keyFactory,
    });

    const agentDifferences = diff(fromAgentMap, toAgentMap);

    for (const difference of agentDifferences) {
      const universalIdentifier = difference.path[0] as string;

      switch (difference.type) {
        case 'CREATE': {
          const fromAgent = fromFlatAgents.find(
            (agent) => keyFactory(agent) === universalIdentifier,
          );
          const toAgent = toFlatAgents.find(
            (agent) => keyFactory(agent) === universalIdentifier,
          );

          if (!toAgent) {
            break;
          }

          if (fromAgent) {
            fromAgent &&
              results.push({
                action: ComparatorAction.UPDATE,
                object: {
                  ...toAgent,
                  id: fromAgent.id,
                },
              });
          } else {
            results.push({
              action: ComparatorAction.CREATE,
              object: toAgent,
            });
          }
          break;
        }
        case 'CHANGE': {
          const fromAgent = fromFlatAgents.find(
            (agent) => keyFactory(agent) === universalIdentifier,
          );
          const toAgent = toFlatAgents.find(
            (agent) => keyFactory(agent) === universalIdentifier,
          );

          if (fromAgent && toAgent) {
            results.push({
              action: ComparatorAction.UPDATE,
              object: {
                ...toAgent,
                id: fromAgent.id,
              },
            });
          }
          break;
        }
        case 'REMOVE': {
          const fromAgent = fromFlatAgents.find(
            (agent) => keyFactory(agent) === universalIdentifier,
          );

          if (fromAgent && difference.path.length === 1) {
            results.push({
              action: ComparatorAction.DELETE,
              object: fromAgent,
            });
          }
          break;
        }
      }
    }

    return results;
  }
}
