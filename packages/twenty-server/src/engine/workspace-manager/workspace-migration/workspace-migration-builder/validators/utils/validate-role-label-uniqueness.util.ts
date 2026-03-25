import { msg } from '@lingui/core/macro';

import {
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateRoleLabelUniqueness = ({
  label,
  existingFlatRoles,
}: {
  label: string;
  existingFlatRoles: UniversalFlatRole[];
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
