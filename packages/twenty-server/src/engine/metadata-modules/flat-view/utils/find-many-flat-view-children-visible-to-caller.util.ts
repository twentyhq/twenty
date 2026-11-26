import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { findFlatViewVisibleToCaller } from 'src/engine/metadata-modules/flat-view/utils/find-flat-view-visible-to-caller.util';
import { isViewVisibleToCaller } from 'src/engine/metadata-modules/view/utils/is-view-visible-to-caller.util';

type FlatViewChildByIdsKey = {
  viewFilterGroupIds: FlatViewFilterGroup;
  viewFilterIds: FlatViewFilter;
  viewGroupIds: FlatViewGroup;
  viewSortIds: FlatViewSort;
};

// Without a viewId, the children of every view available to the user
export const findManyFlatViewChildrenVisibleToCaller = <
  TFlatViewChildIdsKey extends keyof FlatViewChildByIdsKey,
>({
  flatViewMaps,
  flatViewChildMaps,
  flatViewChildIdsKey,
  viewId,
}: {
  flatViewMaps: FlatEntityMaps<FlatView>;
  flatViewChildMaps: FlatEntityMaps<
    FlatViewChildByIdsKey[TFlatViewChildIdsKey]
  >;
  flatViewChildIdsKey: TFlatViewChildIdsKey;
  viewId?: string;
}): FlatViewChildByIdsKey[TFlatViewChildIdsKey][] => {
  const flatViews = isDefined(viewId)
    ? [findFlatViewVisibleToCaller({ viewId, flatViewMaps })]
    : Object.values(flatViewMaps.byUniversalIdentifier).filter(
        (flatView) =>
          isDefined(flatView) && isViewVisibleToCaller({ view: flatView }),
      );

  return flatViews.filter(isDefined).flatMap((flatView) =>
    findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityIds: flatView[flatViewChildIdsKey],
      flatEntityMaps: flatViewChildMaps,
    }),
  );
};
