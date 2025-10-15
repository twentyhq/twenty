import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';

export type CreateViewGroupAction = {
  type: 'create_view_group';
  viewGroup: FlatViewGroup;
};

export type UpdateViewGroupAction = {
  type: 'update_view_group';
  viewGroupId: string;
  updates: FlatEntityPropertiesUpdates<'viewGroup'>;
};

export type DeleteViewGroupAction = {
  type: 'delete_view_group';
  viewGroupId: string;
};

export type WorkspaceMigrationViewGroupActionV2 =
  | CreateViewGroupAction
  | UpdateViewGroupAction
  | DeleteViewGroupAction;

export type WorkspaceMigrationViewGroupActionTypeV2 =
  WorkspaceMigrationViewGroupActionV2['type'];
