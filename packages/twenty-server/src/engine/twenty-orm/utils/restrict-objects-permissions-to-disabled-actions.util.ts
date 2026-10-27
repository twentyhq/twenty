import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionPrincipal } from 'src/engine/twenty-orm/types/permission-principal.type';

const isOwningApplicationPrincipal = ({
  principal,
  flatObjectMetadata,
}: {
  principal: PermissionPrincipal | undefined;
  flatObjectMetadata: FlatObjectMetadata;
}): boolean =>
  principal?.type === 'application' &&
  principal.applicationId === flatObjectMetadata.applicationId;

export const restrictObjectsPermissionsToDisabledActions = ({
  objectsPermissions,
  flatObjectMetadataMaps,
  principal,
}: {
  objectsPermissions: ObjectsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  principal: PermissionPrincipal | undefined;
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
      isOwningApplicationPrincipal({ principal, flatObjectMetadata })
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
