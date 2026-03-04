import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewSortMaps } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort-maps.type';
import { type DeleteViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/delete-view-sort.input';
import {
  ViewSortException,
  ViewSortExceptionCode,
} from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { type UniversalFlatViewSort } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-sort.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';

export const fromDeleteViewSortInputToFlatViewSortOrThrow = ({
  deleteViewSortInput: rawDeleteViewSortInput,
  flatViewSortMaps,
}: {
  deleteViewSortInput: DeleteViewSortInput;
  flatViewSortMaps: FlatViewSortMaps;
}): UniversalFlatViewSort => {
  const { id: viewSortId } = extractAndSanitizeObjectStringFields(
    rawDeleteViewSortInput,
    ['id'],
  );

  const existingFlatViewSortToDelete = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewSortId,
    flatEntityMaps: flatViewSortMaps,
  });

  if (!isDefined(existingFlatViewSortToDelete)) {
    throw new ViewSortException(
      t`View sort not found`,
      ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
    );
  }

  return {
    ...existingFlatViewSortToDelete,
    deletedAt: new Date().toISOString(),
  };
};
