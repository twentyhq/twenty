import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import {
  PermissionFlagException,
  PermissionFlagExceptionCode,
} from 'src/engine/metadata-modules/permission-flag/permission-flag.exception';

export const fromDeletePermissionFlagInputToFlatPermissionFlagOrThrow = ({
  flatPermissionFlagMaps,
  permissionFlagId,
}: {
  flatPermissionFlagMaps: FlatEntityMaps<FlatPermissionFlag>;
  permissionFlagId: string;
}): FlatPermissionFlag => {
  const existing = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: permissionFlagId,
    flatEntityMaps: flatPermissionFlagMaps,
  });

  if (!isDefined(existing)) {
    throw new PermissionFlagException(
      'Permission flag not found',
      PermissionFlagExceptionCode.PERMISSION_FLAG_NOT_FOUND,
    );
  }

  return existing;
};
