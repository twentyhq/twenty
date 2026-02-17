import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type DestroyViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/destroy-view.input';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export const fromDestroyViewInputToFlatViewOrThrow = ({
  destroyViewInput: rawDestroyViewInput,
  flatViewMaps,
}: {
  destroyViewInput: DestroyViewInput;
  flatViewMaps: FlatViewMaps;
}): UniversalFlatView => {
  const { id: viewId } = extractAndSanitizeObjectStringFields(
    rawDestroyViewInput,
    ['id'],
  );

  const existingFlatViewToDestroy = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewId,
    flatEntityMaps: flatViewMaps,
  });

  if (!isDefined(existingFlatViewToDestroy)) {
    throw new ViewException(
      t`View to destroy not found`,
      ViewExceptionCode.VIEW_NOT_FOUND,
    );
  }

  return existingFlatViewToDestroy;
};
