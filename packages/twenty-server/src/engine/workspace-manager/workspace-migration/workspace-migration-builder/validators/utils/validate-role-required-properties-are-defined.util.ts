import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FLAT_ROLE_REQUIRED_PROPERTIES } from 'src/engine/metadata-modules/flat-role/constants/flat-role-required-properties.constants';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateRoleRequiredPropertiesAreDefined = ({
  flatRole,
}: {
  flatRole: UniversalFlatRole;
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
