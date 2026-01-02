import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';

export type CreateViewFilterGroupAction = {
  type: 'create_view_filter_group';
  viewFilterGroup: FlatViewFilterGroup;
};

export type UpdateViewFilterGroupAction = {
  type: 'update_view_filter_group';
  viewFilterGroupId: string;
  updates: FlatEntityPropertiesUpdates<'viewFilterGroup'>;
};

export type DeleteViewFilterGroupAction = {
  type: 'delete_view_filter_group';
  viewFilterGroupId: string;
};

export type WorkspaceMigrationViewFilterGroupActionV2 =
  | CreateViewFilterGroupAction
  | UpdateViewFilterGroupAction
  | DeleteViewFilterGroupAction;

export type WorkspaceMigrationViewFilterGroupActionTypeV2 =
  WorkspaceMigrationViewFilterGroupActionV2['type'];
