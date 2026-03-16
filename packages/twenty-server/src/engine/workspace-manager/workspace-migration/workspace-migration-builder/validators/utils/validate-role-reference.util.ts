import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type RoleLikeMaps = {
  byUniversalIdentifier: Partial<
    Record<string, { isEditable?: boolean } | undefined>
  >;
};

export const validateRoleReference = ({
  flatRoleMaps,
  roleUniversalIdentifier,
}: {
  flatRoleMaps: RoleLikeMaps;
  roleUniversalIdentifier: string | undefined;
}): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  if (!isDefined(roleUniversalIdentifier)) {
    errors.push({
      code: PermissionsExceptionCode.ROLE_NOT_FOUND,
      message: PermissionsExceptionMessage.ROLE_NOT_FOUND,
      userFriendlyMessage: msg`Role not found`,
    });
    return errors;
  }

  const referencedRole =
    flatRoleMaps.byUniversalIdentifier[roleUniversalIdentifier];

  if (!isDefined(referencedRole)) {
    errors.push({
      code: PermissionsExceptionCode.ROLE_NOT_FOUND,
      message: PermissionsExceptionMessage.ROLE_NOT_FOUND,
      userFriendlyMessage: msg`Role not found`,
    });
  } else if (!referencedRole.isEditable) {
    errors.push({
      code: PermissionsExceptionCode.ROLE_NOT_EDITABLE,
      message: PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
      userFriendlyMessage: msg`This role cannot be modified because it is a system role. Only custom roles can be edited.`,
    });
  }

  return errors;
};
