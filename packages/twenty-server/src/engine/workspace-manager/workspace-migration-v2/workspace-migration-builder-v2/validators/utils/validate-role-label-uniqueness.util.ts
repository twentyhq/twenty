import { msg } from '@lingui/core/macro';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import {
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export const validateRoleLabelUniqueness = ({
  label,
  existingFlatRoles,
}: {
  label: string;
  existingFlatRoles: FlatRole[];
}): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  if (existingFlatRoles.some((role) => role.label === label)) {
    errors.push({
      code: PermissionsExceptionCode.ROLE_LABEL_ALREADY_EXISTS,
      message: PermissionsExceptionMessage.ROLE_LABEL_ALREADY_EXISTS,
      userFriendlyMessage: msg`A role with this label already exists.`,
    });
  }

  return errors;
};
