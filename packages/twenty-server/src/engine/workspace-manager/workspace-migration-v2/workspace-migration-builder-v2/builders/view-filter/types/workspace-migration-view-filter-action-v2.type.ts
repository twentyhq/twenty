import { type FlatViewFilterPropertiesToCompare } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter-properties-to-compare.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type CreateViewFilterAction = {
  type: 'create_view_filter';
  viewFilter: FlatViewFilter;
};

export type UpdateViewFilterAction = {
  type: 'update_view_filter';
  viewFilterId: string;
  updates: Array<
    {
      [P in FlatViewFilterPropertiesToCompare]: PropertyUpdate<
        FlatViewFilter,
        P
      >;
    }[FlatViewFilterPropertiesToCompare]
  >;
};

export type DeleteViewFilterAction = {
  type: 'delete_view_filter';
  viewFilterId: string;
};

export type WorkspaceMigrationViewFilterActionV2 =
  | CreateViewFilterAction
  | UpdateViewFilterAction
  | DeleteViewFilterAction;

export type WorkspaceMigrationViewFilterActionTypeV2 =
  WorkspaceMigrationViewFilterActionV2['type'];
