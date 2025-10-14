import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

export type CreateViewFilterAction = {
  type: 'create_view_filter';
  viewFilter: FlatViewFilter;
};

export type UpdateViewFilterAction = {
  type: 'update_view_filter';
  viewFilterId: string;
  updates: FlatEntityPropertiesUpdates<'viewFilter'>;
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
