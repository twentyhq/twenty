import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

export type CreateViewAction = {
  type: 'create_view';
  view: FlatView;
};

export type UpdateViewAction = {
  type: 'update_view';
  viewId: string;
  updates: FlatEntityPropertiesUpdates<'view'>;
};

export type DeleteViewAction = {
  type: 'delete_view';
  viewId: string;
};

export type WorkspaceMigrationViewActionV2 =
  | CreateViewAction
  | UpdateViewAction
  | DeleteViewAction;

export type WorkspaceMigrationViewActionTypeV2 =
  WorkspaceMigrationViewActionV2['type'];
