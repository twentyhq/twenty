import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { isViewVisibleToCaller } from 'src/engine/metadata-modules/view/utils/is-view-visible-to-caller.util';

export const findFlatViewVisibleToCaller = ({
  viewId,
  flatViewMaps,
}: {
  viewId: string;
  flatViewMaps: FlatEntityMaps<FlatView>;
}): FlatView | undefined => {
  const flatView = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewId,
    flatEntityMaps: flatViewMaps,
  });

  return isDefined(flatView) && isViewVisibleToCaller({ view: flatView })
    ? flatView
    : undefined;
};
