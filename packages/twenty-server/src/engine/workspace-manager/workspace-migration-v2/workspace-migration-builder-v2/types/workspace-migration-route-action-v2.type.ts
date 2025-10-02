import { type FlatRoutePropertiesToCompare } from 'src/engine/metadata-modules/route/types/flat-route-properties-to-compare.type';
import { type FlatRoute } from 'src/engine/metadata-modules/route/types/flat-route.type';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type CreateRouteAction = {
  type: 'create_route';
  route: FlatRoute;
};

export type UpdateRouteAction = {
  type: 'update_route';
  routeId: string;
  updates: Array<
    {
      [P in FlatRoutePropertiesToCompare]: PropertyUpdate<FlatRoute, P>;
    }[FlatRoutePropertiesToCompare]
  >;
};

export type DeleteRouteAction = {
  type: 'delete_route';
  routeId: string;
};

export type WorkspaceMigrationRouteActionV2 =
  | CreateRouteAction
  | UpdateRouteAction
  | DeleteRouteAction;
