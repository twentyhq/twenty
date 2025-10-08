import { type FromTo } from 'twenty-shared/types';

import { type FlatViewFieldPropertiesToCompare } from 'src/engine/core-modules/flat-view-field/types/flat-view-field-properties-to-compare.type';
import { type FlatViewField } from 'src/engine/core-modules/flat-view-field/types/flat-view-field.type';
import { type ViewFieldEntity } from 'src/engine/core-modules/view-field/entities/view-field.entity';

export type FlatViewFieldPropertyUpdate<
  P extends FlatViewFieldPropertiesToCompare,
> = {
  property: P;
} & FromTo<ViewFieldEntity[P]>;

export type CreateViewFieldAction = {
  type: 'create_view_field';
  viewField: FlatViewField;
};

export type FlatViewFieldPropertiesUpdates = Array<
  {
    [P in FlatViewFieldPropertiesToCompare]: FlatViewFieldPropertyUpdate<P>;
  }[FlatViewFieldPropertiesToCompare]
>;

export type UpdateViewFieldAction = {
  type: 'update_view_field';
  viewFieldId: string;
  updates: FlatViewFieldPropertiesUpdates;
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
