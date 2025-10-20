import { isDefined } from 'twenty-shared/utils';

import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';

type FlatViewGroupsByViewId = {
  flatViewGroupRecordByViewId: Record<string, Record<string, FlatViewGroup>>;
  highestViewGroupPositionByViewId: Record<string, number>;
};
export const reduceFlatViewGroupsByViewId = ({
  flatViewGroups,
}: {
  flatViewGroups: FlatViewGroup[];
}): FlatViewGroupsByViewId => {
  const initialAccumulator: FlatViewGroupsByViewId = {
    flatViewGroupRecordByViewId: {},
    highestViewGroupPositionByViewId: {},
  };

  return flatViewGroups.reduce((accumulator, flatViewGroup) => {
    const accumulatorHighestPosition =
      accumulator.highestViewGroupPositionByViewId[flatViewGroup.viewId];

    return {
      flatViewGroupRecordByViewId: {
        ...accumulator.flatViewGroupRecordByViewId,
        [flatViewGroup.viewId]: {
          ...accumulator.flatViewGroupRecordByViewId[flatViewGroup.viewId],
          [flatViewGroup.id]: flatViewGroup,
        },
      },
      highestViewGroupPositionByViewId: {
        ...accumulator.highestViewGroupPositionByViewId,
        [flatViewGroup.viewId]: isDefined(accumulatorHighestPosition)
          ? Math.max(accumulatorHighestPosition, flatViewGroup.position)
          : flatViewGroup.position,
      },
    };
  }, initialAccumulator);
};
