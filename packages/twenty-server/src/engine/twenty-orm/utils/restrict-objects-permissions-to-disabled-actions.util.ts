import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const restrictObjectsPermissionsToDisabledActions = ({
  objectsPermissions,
  flatObjectMetadataMaps,
  flatApplicationMaps,
  applicationRoleId,
}: {
  objectsPermissions: ObjectsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatApplicationMaps: FlatApplicationCacheMaps;
  applicationRoleId: string | undefined;
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
      !isNonEmptyArray(disabledObjectPermissionActions)
    ) {
      continue;
    }

    const isOwningApplicationRole =
      isDefined(applicationRoleId) &&
      findActiveFlatApplicationById(
        flatApplicationMaps,
        flatObjectMetadata.applicationId,
      )?.defaultRoleId === applicationRoleId;

    if (isOwningApplicationRole) {
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
