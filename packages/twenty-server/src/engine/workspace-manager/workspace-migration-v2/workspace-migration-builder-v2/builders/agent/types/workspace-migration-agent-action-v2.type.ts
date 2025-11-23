import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

export type CreateAgentAction = {
  type: 'create_agent';
  agent: FlatAgent;
};

export type UpdateAgentAction = {
  type: 'update_agent';
  agentId: string;
  updates: FlatEntityPropertiesUpdates<'agent'>;
};

export type DeleteAgentAction = {
  type: 'delete_agent';
  agentId: string;
};

export type WorkspaceMigrationAgentActionV2 =
  | CreateAgentAction
  | UpdateAgentAction
  | DeleteAgentAction;

export type WorkspaceMigrationAgentActionTypeV2 =
  WorkspaceMigrationAgentActionV2['type'];

