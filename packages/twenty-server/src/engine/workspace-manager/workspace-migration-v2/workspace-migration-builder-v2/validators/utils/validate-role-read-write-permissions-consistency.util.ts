import { msg } from '@lingui/core/macro';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import {
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export const validateRoleReadWritePermissionsConsistency = ({
  flatRole,
}: {
  flatRole: FlatRole;
}): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  if (
    flatRole.canReadAllObjectRecords === false &&
    (flatRole.canUpdateAllObjectRecords ||
      flatRole.canSoftDeleteAllObjectRecords ||
      flatRole.canDestroyAllObjectRecords)
  ) {
    errors.push({
      code: PermissionsExceptionCode.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION,
      message:
        PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION,
      userFriendlyMessage: msg`You cannot grant edit permissions without also granting read permissions. Please enable read access first.`,
    });
  }

  return errors;
};
