import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { isViewVisibleToUser } from 'src/engine/metadata-modules/view/utils/is-view-visible-to-user.util';

export const isViewAvailableToUser = ({
  flatView,
  userWorkspaceId,
}: {
  flatView: Pick<
    FlatView,
    | 'isPrivate'
    | 'createdByUserWorkspaceId'
    | 'overrides'
    | 'applicationUniversalIdentifier'
  >;
  userWorkspaceId?: string;
}): boolean => isViewVisibleToUser(flatView, userWorkspaceId);
