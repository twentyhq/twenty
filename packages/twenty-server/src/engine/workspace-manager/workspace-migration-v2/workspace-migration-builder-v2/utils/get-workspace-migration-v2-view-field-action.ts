import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import {
  type CreateViewFieldAction,
  type DeleteViewFieldAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-field-action-v2.type';

export const getWorkspaceMigrationV2ViewFieldCreateAction = ({
  flatViewField,
}: {
  flatViewField: FlatViewField;
}): CreateViewFieldAction => ({
  type: 'create_view_field',
  viewField: flatViewField,
});

export const getWorkspaceMigrationV2ViewFieldDeleteAction = (
  flatViewField: FlatViewField,
): DeleteViewFieldAction => ({
  type: 'delete_view_field',
  viewFieldId: flatViewField.id,
});
