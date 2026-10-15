import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';

export const buildMorphRelationHeadFieldPermissionUpdates = ({
  destinationFieldByOriginFieldId,
  flatFieldPermissionMaps,
}: {
  destinationFieldByOriginFieldId: Map<string, FlatFieldMetadata>;
  flatFieldPermissionMaps: FlatEntityMaps<FlatFieldPermission>;
}): FlatFieldPermission[] => {
  const fieldPermissions = Object.values(
    flatFieldPermissionMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const fieldPermissionKeys = new Set(
    fieldPermissions.map(
      (fieldPermission) =>
        `${fieldPermission.roleId}:${fieldPermission.fieldMetadataId}`,
    ),
  );

  return fieldPermissions.flatMap((fieldPermission) => {
    const destination = destinationFieldByOriginFieldId.get(
      fieldPermission.fieldMetadataId,
    );
    const destinationKey = `${fieldPermission.roleId}:${destination?.id}`;

    if (!isDefined(destination) || fieldPermissionKeys.has(destinationKey)) {
      return [];
    }

    fieldPermissionKeys.add(destinationKey);

    return [
      {
        ...fieldPermission,
        fieldMetadataId: destination.id,
        fieldMetadataUniversalIdentifier: destination.universalIdentifier,
      },
    ];
  });
};
