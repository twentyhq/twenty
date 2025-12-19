import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FLAT_ROLE_REQUIRED_PROPERTIES } from 'src/engine/metadata-modules/flat-role/constants/flat-role-required-properties.constants';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export const validateRoleRequiredPropertiesAreDefined = ({
  flatRole,
}: {
  flatRole: FlatRole;
}): FlatEntityValidationError[] =>
  FLAT_ROLE_REQUIRED_PROPERTIES.flatMap<FlatEntityValidationError>(
    (property) => {
      if (isDefined(flatRole[property])) {
        return [];
      }

      return [
        {
          code: PermissionsExceptionCode.INVALID_ARG,
          message: t`Property ${property} is required for role`,
          userFriendlyMessage: msg`Some of the information provided is invalid. Please check your input and try again.`,
        },
      ];
    },
  );
