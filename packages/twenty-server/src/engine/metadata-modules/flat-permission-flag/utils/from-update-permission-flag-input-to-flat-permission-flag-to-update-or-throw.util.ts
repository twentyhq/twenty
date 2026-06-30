import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FLAT_PERMISSION_FLAG_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-permission-flag/constants/flat-permission-flag-editable-properties.constant';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import {
  PermissionFlagException,
  PermissionFlagExceptionCode,
} from 'src/engine/metadata-modules/permission-flag/permission-flag.exception';
import { type UpdatePermissionFlagInput } from 'src/engine/metadata-modules/permission-flag/dtos/update-permission-flag.input';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdatePermissionFlagInputToFlatPermissionFlagToUpdateOrThrow =
  ({
    flatPermissionFlagMaps,
    updatePermissionFlagInput,
  }: {
    flatPermissionFlagMaps: FlatEntityMaps<FlatPermissionFlag>;
    updatePermissionFlagInput: UpdatePermissionFlagInput;
  }): FlatPermissionFlag => {
    const existing = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: updatePermissionFlagInput.id,
      flatEntityMaps: flatPermissionFlagMaps,
    });

    if (!isDefined(existing)) {
      throw new PermissionFlagException(
        'Permission flag not found',
        PermissionFlagExceptionCode.PERMISSION_FLAG_NOT_FOUND,
      );
    }

    return {
      ...mergeUpdateInExistingRecord({
        existing,
        properties: [...FLAT_PERMISSION_FLAG_EDITABLE_PROPERTIES],
        update: updatePermissionFlagInput.update,
      }),
      updatedAt: new Date().toISOString(),
    };
  };
