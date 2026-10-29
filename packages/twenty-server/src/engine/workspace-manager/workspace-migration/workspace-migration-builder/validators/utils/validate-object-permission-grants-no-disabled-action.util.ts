import { msg, t } from '@lingui/core/macro';
import { type ObjectPermissionAction } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateObjectPermissionGrantsNoDisabledAction = ({
  flatObjectPermission,
  flatObjectMetadata,
  flatRole,
  applicationDefaultRoleUniversalIdentifier,
}: {
  flatObjectPermission: Pick<
    UniversalFlatObjectPermission,
    ObjectPermissionAction | 'objectMetadataUniversalIdentifier'
  >;
  flatObjectMetadata:
    | Pick<
        UniversalFlatObjectMetadata,
        'disabledObjectPermissionActions' | 'applicationUniversalIdentifier'
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
  if (!isDefined(flatObjectMetadata)) {
    return [];
  }

  // mirrors the runtime: only the owning application's default role keeps disabled actions
  if (
    isDefined(flatRole) &&
    flatRole.universalIdentifier ===
      applicationDefaultRoleUniversalIdentifier &&
    flatRole.applicationUniversalIdentifier ===
      flatObjectMetadata.applicationUniversalIdentifier
  ) {
    return [];
  }

  return (flatObjectMetadata.disabledObjectPermissionActions ?? [])
    .filter((action) => flatObjectPermission[action])
    .map((action) => ({
      code: PermissionsExceptionCode.INVALID_SETTING,
      message: t`${action} is disabled on object ${flatObjectPermission.objectMetadataUniversalIdentifier}`,
      userFriendlyMessage: msg`This permission is disabled on the object and cannot be granted`,
      value: action,
    }));
};
