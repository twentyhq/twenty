import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewSortMaps } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort-maps.type';
import { type DestroyViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/destroy-view-sort.input';
import {
  ViewSortException,
  ViewSortExceptionCode,
} from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type UniversalFlatViewSort } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-sort.type';

export const fromDestroyViewSortInputToFlatViewSortOrThrow = ({
  destroyViewSortInput,
  flatViewSortMaps,
}: {
  destroyViewSortInput: DestroyViewSortInput;
  flatViewSortMaps: FlatViewSortMaps;
}): UniversalFlatViewSort => {
  const { id: viewSortId } = extractAndSanitizeObjectStringFields(
    destroyViewSortInput,
    ['id'],
  );

  const existingFlatViewSortToDestroy = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewSortId,
    flatEntityMaps: flatViewSortMaps,
  });

  if (!isDefined(existingFlatViewSortToDestroy)) {
    throw new ViewSortException(
      t`View sort not found`,
      ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
    );
  }

  return existingFlatViewSortToDestroy;
};
