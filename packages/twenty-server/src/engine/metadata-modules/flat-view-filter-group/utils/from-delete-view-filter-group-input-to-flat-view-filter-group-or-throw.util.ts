import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewFilterGroupMaps } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group-maps.type';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type DeleteViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/delete-view-filter-group.input';
import {
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
} from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';

export const fromDeleteViewFilterGroupInputToFlatViewFilterGroupOrThrow = ({
  deleteViewFilterGroupInput: rawDeleteViewFilterGroupInput,
  flatViewFilterGroupMaps,
}: {
  deleteViewFilterGroupInput: DeleteViewFilterGroupInput;
  flatViewFilterGroupMaps: FlatViewFilterGroupMaps;
}): FlatViewFilterGroup => {
  const { id: viewFilterGroupId } = extractAndSanitizeObjectStringFields(
    rawDeleteViewFilterGroupInput,
    ['id'],
  );

  const existingFlatViewFilterGroupToDelete =
    flatViewFilterGroupMaps.byId[viewFilterGroupId];

  if (!isDefined(existingFlatViewFilterGroupToDelete)) {
    throw new ViewFilterGroupException(
      'View filter group not found',
      ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
    );
  }

  return {
    ...existingFlatViewFilterGroupToDelete,
    deletedAt: new Date().toISOString(),
  };
};
