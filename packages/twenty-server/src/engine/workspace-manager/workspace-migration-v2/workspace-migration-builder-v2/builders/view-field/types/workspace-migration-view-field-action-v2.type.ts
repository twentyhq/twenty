import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';

export type CreateViewFieldAction = {
  type: 'create_view_field';
  viewField: FlatViewField;
};

export type UpdateViewFieldAction = {
  type: 'update_view_field';
  viewFieldId: string;
  updates: FlatEntityPropertiesUpdates<'viewField'>;
};

export type DeleteViewFieldAction = {
  type: 'delete_view_field';
  viewFieldId: string;
};

export type WorkspaceMigrationViewFieldActionV2 =
  | CreateViewFieldAction
  | UpdateViewFieldAction
  | DeleteViewFieldAction;

export type WorkspaceMigrationViewFieldActionTypeV2 =
  WorkspaceMigrationViewFieldActionV2['type'];
