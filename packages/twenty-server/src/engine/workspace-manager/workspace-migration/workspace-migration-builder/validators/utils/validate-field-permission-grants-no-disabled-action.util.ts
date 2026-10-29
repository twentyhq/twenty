import { msg, t } from '@lingui/core/macro';
import { type FieldPermissionAction } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatFieldPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-permission.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateFieldPermissionGrantsNoDisabledAction = ({
  flatFieldPermission,
  flatFieldMetadata,
  flatRole,
  applicationDefaultRoleUniversalIdentifier,
}: {
  flatFieldPermission: Pick<
    UniversalFlatFieldPermission,
    FieldPermissionAction | 'fieldMetadataUniversalIdentifier'
  >;
  flatFieldMetadata:
    | Pick<
        UniversalFlatFieldMetadata,
        'disabledFieldPermissionActions' | 'applicationUniversalIdentifier'
      >
    | undefined;
  flatRole:
    | Pick<
        UniversalFlatRole,
        'universalIdentifier' | 'applicationUniversalIdentifier'
      >
    | undefined;
  applicationDefaultRoleUniversalIdentifier: string | undefined;
}): FlatEntityValidationError[] => {
  if (!isDefined(flatFieldMetadata)) {
    return [];
  }

  // mirrors the runtime: only the owning application's default role keeps disabled actions
  if (
    isDefined(flatRole) &&
    flatRole.universalIdentifier ===
      applicationDefaultRoleUniversalIdentifier &&
    flatRole.applicationUniversalIdentifier ===
      flatFieldMetadata.applicationUniversalIdentifier
  ) {
    return [];
  }

  return (flatFieldMetadata.disabledFieldPermissionActions ?? [])
    .filter((action) => flatFieldPermission[action])
    .map((action) => ({
      code: PermissionsExceptionCode.INVALID_SETTING,
      message: t`${action} is disabled on field ${flatFieldPermission.fieldMetadataUniversalIdentifier}`,
      userFriendlyMessage: msg`This permission is disabled on the field and cannot be granted`,
      value: action,
    }));
};
