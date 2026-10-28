import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { STANDARD_PERMISSION_FLAG_DEFINITIONS } from 'src/engine/metadata-modules/permission-flag/constants/standard-permission-flag-definitions.constant';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const getPermissionFlagNotFoundError = (
  permissionFlagUniversalIdentifier: string,
): FlatEntityValidationError => {
  const standardPermissionFlagKey = STANDARD_PERMISSION_FLAG_DEFINITIONS.find(
    (standardPermissionFlagDefinition) =>
      standardPermissionFlagDefinition.universalIdentifier ===
      permissionFlagUniversalIdentifier,
  )?.key;

  const permissionFlagName =
    standardPermissionFlagKey ?? permissionFlagUniversalIdentifier;

  return {
    code: PermissionsExceptionCode.INVALID_SETTING,
    message: isDefined(standardPermissionFlagKey)
      ? t`Standard permission flag ${standardPermissionFlagKey} (${permissionFlagUniversalIdentifier}) not found in this workspace. Run the workspace upgrade to create it.`
      : t`Permission flag ${permissionFlagUniversalIdentifier} not found in this workspace`,
    userFriendlyMessage: msg`Permission flag ${permissionFlagName} is not available in this workspace`,
  };
};
