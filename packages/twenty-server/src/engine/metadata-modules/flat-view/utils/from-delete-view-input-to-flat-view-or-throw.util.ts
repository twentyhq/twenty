import { t } from '@lingui/core/macro';
import { ViewKey } from 'twenty-shared/types';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/utils/is-caller-overriding-entity.util';
import { type DeleteViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/delete-view.input';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export const fromDeleteViewInputToFlatViewOrThrow = ({
  deleteViewInput: rawDeleteViewInput,
  flatViewMaps,
  callerApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  deleteViewInput: DeleteViewInput;
  flatViewMaps: FlatViewMaps;
  callerApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
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

  if (existingFlatViewToDelete.key === ViewKey.INDEX) {
    throw new ViewException(
      t`Index views cannot be deleted`,
      ViewExceptionCode.INVALID_VIEW_DATA,
    );
  }

  const now = new Date().toISOString();

  const shouldDeactivate = isCallerOverridingEntity({
    callerApplicationUniversalIdentifier,
    entityApplicationUniversalIdentifier:
      existingFlatViewToDelete.applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  });

  if (shouldDeactivate) {
    return {
      ...existingFlatViewToDelete,
      isActive: false,
      updatedAt: now,
    };
  }

  return {
    ...existingFlatViewToDelete,
    deletedAt: now,
  };
};
