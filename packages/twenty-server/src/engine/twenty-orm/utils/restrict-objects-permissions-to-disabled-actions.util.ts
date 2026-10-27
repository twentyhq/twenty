import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

// An application's role is always one of its own, so the role's owner is the acting application
const isOwningApplicationRole = ({
  roleSource,
  flatRole,
  flatObjectMetadata,
}: {
  roleSource: keyof RoleIdsBySource;
  flatRole: Pick<FlatRole, 'applicationId'> | undefined;
  flatObjectMetadata: Pick<FlatObjectMetadata, 'applicationId'>;
}): boolean =>
  roleSource === 'applicationRoleId' &&
  flatRole?.applicationId === flatObjectMetadata.applicationId;

export const restrictObjectsPermissionsToDisabledActions = ({
  objectsPermissions,
  flatObjectMetadataMaps,
  roleSource,
  flatRole,
}: {
  objectsPermissions: ObjectsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  roleSource: keyof RoleIdsBySource;
  flatRole: Pick<FlatRole, 'applicationId'> | undefined;
}): ObjectsPermissions => {
  let restrictedObjectsPermissions: ObjectsPermissions | undefined;

  for (const [objectMetadataId, objectPermissions] of Object.entries(
    objectsPermissions,
  )) {
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });
    const disabledObjectPermissionActions =
      flatObjectMetadata?.disabledObjectPermissionActions;

    if (
      !isDefined(flatObjectMetadata) ||
      !isNonEmptyArray(disabledObjectPermissionActions) ||
      isOwningApplicationRole({ roleSource, flatRole, flatObjectMetadata })
    ) {
      continue;
    }

    restrictedObjectsPermissions ??= { ...objectsPermissions };
    restrictedObjectsPermissions[objectMetadataId] = {
      ...objectPermissions,
      ...Object.fromEntries(
        disabledObjectPermissionActions.map((action) => [action, false]),
      ),
    };
  }

  return restrictedObjectsPermissions ?? objectsPermissions;
};
