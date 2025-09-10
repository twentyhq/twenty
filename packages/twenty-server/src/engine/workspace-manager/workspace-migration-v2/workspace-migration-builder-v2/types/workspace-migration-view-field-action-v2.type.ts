import { type FromTo } from 'twenty-shared/types';

import { type ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { type FlatViewFieldPropertiesToCompare } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-properties-to-compare.type';
import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';

export type FlatViewFieldPropertyUpdate<
  P extends FlatViewFieldPropertiesToCompare,
> = {
  property: P;
} & FromTo<ViewFieldEntity[P]>;

export type CreateViewFieldAction = {
  type: 'create_view_field';
  viewField: FlatViewField;
};

export type UpdateViewFieldAction = {
  type: 'update_view_field';
  viewFieldId: string;
  updates: Array<
    {
      [P in FlatViewFieldPropertiesToCompare]: FlatViewFieldPropertyUpdate<P>;
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
