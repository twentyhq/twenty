import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewGroupMaps } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type DeleteViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/delete-view-group.input';
import {
  ViewGroupException,
  ViewGroupExceptionCode,
} from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';

export const fromDeleteViewGroupInputToFlatViewGroupOrThrow = ({
  deleteViewGroupInput: rawDeleteViewGroupInput,
  flatViewGroupMaps,
}: {
  deleteViewGroupInput: DeleteViewGroupInput;
  flatViewGroupMaps: FlatViewGroupMaps;
}): UniversalFlatViewGroup => {
  const { id: viewGroupId } = extractAndSanitizeObjectStringFields(
    rawDeleteViewGroupInput,
    ['id'],
  );

  const existingFlatViewGroupToDelete = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewGroupId,
    flatEntityMaps: flatViewGroupMaps,
  });

  if (!isDefined(existingFlatViewGroupToDelete)) {
    throw new ViewGroupException(
      t`View group to delete not found`,
      ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
    );
  }

  return {
    ...existingFlatViewGroupToDelete,
    deletedAt: new Date().toISOString(),
  };
};
