import { type FlatViewFieldPropertiesToCompare } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-properties-to-compare.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type CreateViewFieldAction = {
  type: 'create_view_field';
  viewField: FlatViewField;
};

export type UpdateViewFieldAction = {
  type: 'update_view_field';
  viewFieldId: string;
  updates: Array<
    {
      [P in FlatViewFieldPropertiesToCompare]: PropertyUpdate<
        FlatViewField,
        P
      >;
    }[FlatViewFieldPropertiesToCompare]
  >;
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
