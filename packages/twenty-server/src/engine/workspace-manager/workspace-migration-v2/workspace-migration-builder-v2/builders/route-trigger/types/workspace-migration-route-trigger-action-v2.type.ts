import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';

export type CreateRouteTriggerAction = {
  type: 'create_route_trigger';
  routeTrigger: FlatRouteTrigger;
};

export type UpdateRouteTriggerAction = {
  type: 'update_route_trigger';
  routeTriggerId: string;
  updates: FlatEntityPropertiesUpdates<'routeTrigger'>;
};

export type DeleteRouteTriggerAction = {
  type: 'delete_route_trigger';
  routeTriggerId: string;
};

export type WorkspaceMigrationRouteTriggerActionV2 =
  | CreateRouteTriggerAction
  | UpdateRouteTriggerAction
  | DeleteRouteTriggerAction;
