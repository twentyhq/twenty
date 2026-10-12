import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { isInitialObjectView } from 'src/engine/metadata-modules/view/utils/is-initial-object-view.util';
import { isViewVisibleToUser } from 'src/engine/metadata-modules/view/utils/is-view-visible-to-user.util';

export const isViewAvailableToUser = ({
  flatView,
  userWorkspaceId,
  isInitialObjectViewEnabled,
}: {
  flatView: Pick<
    FlatView,
    | 'deletedAt'
    | 'visibility'
    | 'createdByUserWorkspaceId'
    | 'universalIdentifier'
    | 'applicationUniversalIdentifier'
    | 'objectMetadataUniversalIdentifier'
  >;
  userWorkspaceId?: string;
  isInitialObjectViewEnabled: boolean;
}): boolean =>
  flatView.deletedAt === null &&
  (isInitialObjectViewEnabled || !isInitialObjectView(flatView)) &&
  isViewVisibleToUser(flatView, userWorkspaceId);
