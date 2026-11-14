import { isDefined } from 'twenty-shared/utils';

import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

// Scope views share the visibility of the view holding their owner column, so they follow its changes
export const computeScopeFlatViewsFollowingVisibility = ({
  flatViewToUpdate,
  flatViewMaps,
}: {
  flatViewToUpdate: UniversalFlatView;
  flatViewMaps: FlatViewMaps;
}): UniversalFlatView[] => {
  const viewFieldUniversalIdentifiers = new Set(
    flatViewToUpdate.viewFieldUniversalIdentifiers,
  );

  return Object.values(flatViewMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (flatView) =>
        isDefined(flatView.ownerViewFieldUniversalIdentifier) &&
        viewFieldUniversalIdentifiers.has(
          flatView.ownerViewFieldUniversalIdentifier,
        ) &&
        (flatView.visibility !== flatViewToUpdate.visibility ||
          flatView.createdByUserWorkspaceId !==
            flatViewToUpdate.createdByUserWorkspaceId),
    )
    .map((flatView) => ({
      ...flatView,
      visibility: flatViewToUpdate.visibility,
      createdByUserWorkspaceId: flatViewToUpdate.createdByUserWorkspaceId,
      updatedAt: flatViewToUpdate.updatedAt,
    }));
};
