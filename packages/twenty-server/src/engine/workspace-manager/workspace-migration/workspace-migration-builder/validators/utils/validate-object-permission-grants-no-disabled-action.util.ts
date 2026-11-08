import { msg, t } from '@lingui/core/macro';
import {
  OBJECT_PERMISSION_ACTIONS,
  type ObjectPermissionAction,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { isApplicationGrantRole } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/is-application-grant-role.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateObjectPermissionGrantsNoDisabledAction = ({
  flatObjectPermission,
  flatObjectMetadata,
  flatRole,
  applicationDefaultRoleUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
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
  workspaceCustomApplicationUniversalIdentifier: string;
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

  // A grant copies its application's default role
  if (
    isApplicationGrantRole({
      flatRole,
      grantedApplicationUniversalIdentifier:
        flatObjectMetadata.applicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
    })
  ) {
    return [];
  }

  const disabledActions: string[] =
    flatObjectMetadata.disabledObjectPermissionActions ?? [];

  // create follows update for now, so disabling create alone must not block granting update
  return OBJECT_PERMISSION_ACTIONS.filter(
    (action) =>
      disabledActions.includes(action) && flatObjectPermission[action],
  ).map((action) => ({
    code: PermissionsExceptionCode.INVALID_SETTING,
    message: t`${action} is disabled on object ${flatObjectPermission.objectMetadataUniversalIdentifier}`,
    userFriendlyMessage: msg`This permission is disabled on the object and cannot be granted`,
    value: action,
  }));
};
