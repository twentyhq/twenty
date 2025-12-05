import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';

export type UpdateAgentAction = {
  type: 'update_agent';
  flatEntityId: string;
  flatEntityUpdates: FlatEntityPropertiesUpdates<'agent'>;
};

export type CreateAgentAction = {
  type: 'create_agent';
  flatEntity: FlatAgent;
};

export type DeleteAgentAction = {
  type: 'delete_agent';
  flatEntityId: string;
};
