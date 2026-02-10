import { msg } from '@lingui/core/macro';

import {
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateRoleReadWritePermissionsConsistency = ({
  flatRole,
}: {
  flatRole: UniversalFlatRole;
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
