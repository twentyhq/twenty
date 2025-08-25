import { type ViewField } from 'src/engine/core-modules/view/entities/view-field.entity';
import { type View } from 'src/engine/core-modules/view/entities/view.entity';

export type FlatViewField = Pick<
  ViewField,
  'fieldMetadataId' | 'position' | 'isVisible' | 'size'
>;

export type FlatView = Pick<
  View,
  'name' | 'objectMetadataId' | 'type' | 'isCustom' | 'key' | 'icon'
> & {
  viewFields: FlatViewField[];
};

export type CreateViewAction = {
  type: 'create_view';
  view: FlatView;
};

export type WorkspaceMigrationViewActionV2 = CreateViewAction;

export type WorkspaceMigrationViewActionTypeV2 =
  WorkspaceMigrationViewActionV2['type'];
