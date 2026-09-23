import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { validateOperationIsPermittedOrThrow } from 'src/engine/twenty-orm/repository/permissions.utils';
import { getObjectsPermissionsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-objects-permissions-from-role-permission-config.util';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';

export const assertAuthContextCanUpdateFieldOrThrow = ({
  authContext,
  fieldMetadataId,
  rolesPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  userWorkspaceRoleMap,
  apiKeyRoleMap,
}: {
  authContext: WorkspaceAuthContext;
  fieldMetadataId: string;
  rolesPermissions: ObjectsPermissionsByRoleId;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
}): void => {
  if (isSystemAuthContext(authContext)) {
    return;
  }

  const rolePermissionConfig = resolveRolePermissionConfig({
    authContext,
    userWorkspaceRoleMap,
    apiKeyRoleMap,
  });

  const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps: flatFieldMetadataMaps,
    flatEntityId: fieldMetadataId,
  });

  const objectMetadata = isDefined(fieldMetadata)
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: fieldMetadata.objectMetadataId,
      })
    : undefined;

  if (
    !isDefined(rolePermissionConfig) ||
    !isDefined(fieldMetadata) ||
    !isDefined(objectMetadata)
  ) {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }

  validateOperationIsPermittedOrThrow({
    entityName: objectMetadata.nameSingular,
    operationType: 'update',
    objectsPermissions: getObjectsPermissionsFromRolePermissionConfig({
      rolesPermissions,
      rolePermissionConfig,
    }),
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    objectIdByNameSingular: {
      [objectMetadata.nameSingular]: objectMetadata.id,
    },
    selectedColumns: [],
    allFieldsSelected: false,
    updatedColumns: [fieldMetadata.name],
    authContext,
  });
};
