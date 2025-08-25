import { type FlatView } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-view.type';

export type CreateViewAction = {
  type: 'create_view';
  view: FlatView;
};

export type WorkspaceMigrationViewActionV2 = CreateViewAction;

export type WorkspaceMigrationViewActionTypeV2 =
  WorkspaceMigrationViewActionV2['type'];
