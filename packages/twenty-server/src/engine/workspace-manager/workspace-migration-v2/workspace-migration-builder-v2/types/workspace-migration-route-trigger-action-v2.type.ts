import { type FlatRouteTriggerPropertiesToCompare } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger-properties-to-compare.type';
import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type CreateRouteTriggerAction = {
  type: 'create_route_trigger';
  routeTrigger: FlatRouteTrigger;
};

export type UpdateRouteTriggerAction = {
  type: 'update_route_trigger';
  routeTriggerId: string;
  updates: Array<
    {
      [P in FlatRouteTriggerPropertiesToCompare]: PropertyUpdate<
        FlatRouteTrigger,
        P
      >;
    }[FlatRouteTriggerPropertiesToCompare]
  >;
};

export type DeleteRouteTriggerAction = {
  type: 'delete_route_trigger';
  routeTriggerId: string;
};

export type WorkspaceMigrationRouteTriggerActionV2 =
  | CreateRouteTriggerAction
  | UpdateRouteTriggerAction
  | DeleteRouteTriggerAction;
