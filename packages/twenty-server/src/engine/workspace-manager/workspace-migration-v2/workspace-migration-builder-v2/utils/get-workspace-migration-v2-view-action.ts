import { type FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';
import {
  type CreateViewAction,
  type DeleteViewAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2.type';

export const getWorkspaceMigrationV2ViewCreateAction = ({
  flatView,
}: {
  flatView: FlatView;
}): CreateViewAction => ({
  type: 'create_view',
  view: flatView,
});

export const getWorkspaceMigrationV2ViewDeleteAction = (
  flatView: FlatView,
): DeleteViewAction => ({
  type: 'delete_view',
  viewId: flatView.id,
});
