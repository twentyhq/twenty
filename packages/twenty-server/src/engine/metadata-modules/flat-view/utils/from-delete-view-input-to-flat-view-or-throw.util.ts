import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type DeleteViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/delete-view.input';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export const fromDeleteViewInputToFlatViewOrThrow = ({
  deleteViewInput: rawDeleteViewInput,
  flatViewMaps,
}: {
  deleteViewInput: DeleteViewInput;
  flatViewMaps: FlatViewMaps;
}): UniversalFlatView => {
  const { id: viewId } = extractAndSanitizeObjectStringFields(
    rawDeleteViewInput,
    ['id'],
  );

  const existingFlatViewToDelete = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewId,
    flatEntityMaps: flatViewMaps,
  });

  if (!isDefined(existingFlatViewToDelete)) {
    throw new ViewException(
      t`View to delete not found`,
      ViewExceptionCode.VIEW_NOT_FOUND,
    );
  }

  return {
    ...existingFlatViewToDelete,
    deletedAt: new Date().toISOString(),
  };
};
