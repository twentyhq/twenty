import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { isViewAvailableToUser } from 'src/engine/metadata-modules/view/utils/is-view-available-to-user.util';

export const findFlatViewAvailableToUser = ({
  viewId,
  flatViewMaps,
  userWorkspaceId,
}: {
  viewId: string;
  flatViewMaps: FlatEntityMaps<FlatView>;
  userWorkspaceId: string | undefined;
}): FlatView | undefined => {
  const flatView = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewId,
    flatEntityMaps: flatViewMaps,
  });

  return isDefined(flatView) &&
    isViewAvailableToUser({ flatView, userWorkspaceId })
    ? flatView
    : undefined;
};
