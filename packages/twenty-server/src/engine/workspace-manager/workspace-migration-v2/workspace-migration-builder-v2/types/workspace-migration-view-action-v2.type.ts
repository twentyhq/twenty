import { type FromTo } from 'twenty-shared/types';

import { type ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { type FlatViewPropertiesToCompare } from 'src/engine/core-modules/view/flat-view/types/flat-view-properties-to-compare.type';
import { type FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';

export type FlatViewPropertyUpdate<P extends FlatViewPropertiesToCompare> = {
  property: P;
} & FromTo<ViewEntity[P]>;

export type CreateViewAction = {
  type: 'create_view';
  view: FlatView;
};

export type UpdateViewAction = {
  type: 'update_view';
  viewId: string;
  updates: Array<
    {
      [P in FlatViewPropertiesToCompare]: FlatViewPropertyUpdate<P>;
    }[FlatViewPropertiesToCompare]
  >;
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
