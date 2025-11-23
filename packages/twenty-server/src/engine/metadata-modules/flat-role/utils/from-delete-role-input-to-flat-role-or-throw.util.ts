import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

export const fromDeleteRoleInputToFlatRoleOrThrow = ({
  flatRoleMaps,
  roleId,
}: {
  flatRoleMaps: FlatEntityMaps<FlatRole>;
  roleId: string;
}): FlatRole => {
  const existingFlatRole = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: roleId,
    flatEntityMaps: flatRoleMaps,
  });

  if (!isDefined(existingFlatRole)) {
    throw new PermissionsException(
      'Role not found',
      PermissionsExceptionCode.ROLE_NOT_FOUND,
      {
        userFriendlyMessage: msg`The role you are looking for could not be found. It may have been deleted or you may not have access to it.`,
      },
    );
  }

  return existingFlatRole;
};
