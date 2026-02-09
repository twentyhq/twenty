import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewFilterGroupMaps } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type DeleteViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/delete-view-filter-group.input';
import {
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
} from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';
import { type UniversalFlatViewFilterGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter-group.type';

export const fromDeleteViewFilterGroupInputToFlatViewFilterGroupOrThrow = ({
  deleteViewFilterGroupInput: rawDeleteViewFilterGroupInput,
  flatViewFilterGroupMaps,
}: {
  deleteViewFilterGroupInput: DeleteViewFilterGroupInput;
  flatViewFilterGroupMaps: FlatViewFilterGroupMaps;
}): UniversalFlatViewFilterGroup => {
  const { id: viewFilterGroupId } = extractAndSanitizeObjectStringFields(
    rawDeleteViewFilterGroupInput,
    ['id'],
  );

  const existingFlatViewFilterGroupToDelete =
    findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: viewFilterGroupId,
      flatEntityMaps: flatViewFilterGroupMaps,
    });

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
