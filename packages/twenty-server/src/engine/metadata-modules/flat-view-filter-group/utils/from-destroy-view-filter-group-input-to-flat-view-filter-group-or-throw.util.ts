import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewFilterGroupMaps } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group-maps.type';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type DestroyViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/destroy-view-filter-group.input';
import {
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
} from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';

export const fromDestroyViewFilterGroupInputToFlatViewFilterGroupOrThrow = ({
  destroyViewFilterGroupInput,
  flatViewFilterGroupMaps,
}: {
  destroyViewFilterGroupInput: DestroyViewFilterGroupInput;
  flatViewFilterGroupMaps: FlatViewFilterGroupMaps;
}): FlatViewFilterGroup => {
  const { id: viewFilterGroupId } = extractAndSanitizeObjectStringFields(
    destroyViewFilterGroupInput,
    ['id'],
  );

  const existingFlatViewFilterGroupToDestroy =
    flatViewFilterGroupMaps.byId[viewFilterGroupId];

  if (!isDefined(existingFlatViewFilterGroupToDestroy)) {
    throw new ViewFilterGroupException(
      'View filter group not found',
      ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
    );
  }

  return existingFlatViewFilterGroupToDestroy;
};
