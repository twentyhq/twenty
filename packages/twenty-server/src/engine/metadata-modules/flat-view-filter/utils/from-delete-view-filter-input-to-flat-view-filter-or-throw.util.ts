import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewFilterMaps } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type DeleteViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/delete-view-filter.input';
import {
  ViewFilterException,
  ViewFilterExceptionCode,
} from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { type UniversalFlatViewFilter } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter.type';

export const fromDeleteViewFilterInputToFlatViewFilterOrThrow = ({
  deleteViewFilterInput: rawDeleteViewFilterInput,
  flatViewFilterMaps,
}: {
  deleteViewFilterInput: DeleteViewFilterInput;
  flatViewFilterMaps: FlatViewFilterMaps;
}): UniversalFlatViewFilter => {
  const { id: viewFilterId } = extractAndSanitizeObjectStringFields(
    rawDeleteViewFilterInput,
    ['id'],
  );

  const existingFlatViewFilterToDelete = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewFilterId,
    flatEntityMaps: flatViewFilterMaps,
  });

  if (!isDefined(existingFlatViewFilterToDelete)) {
    throw new ViewFilterException(
      t`View filter to delete not found`,
      ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
    );
  }

  return {
    ...existingFlatViewFilterToDelete,
    deletedAt: new Date().toISOString(),
  };
};
