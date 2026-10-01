/* @license Enterprise */

import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { resolveDiscoverableFieldMetadataIds } from 'src/engine/core-modules/record-share/utils/resolve-discoverable-field-metadata-ids.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// An existence read admits discoverable records without a grant, so every
// other field of those objects reads as a field the role cannot read: the
// select, filter and order-by checks that enforce field permissions then keep
// the read to what the object lets be discovered.
export const restrictObjectsPermissionsToDiscoverableFields = ({
  objectsPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  objectsPermissions: ObjectsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): ObjectsPermissions => {
  const restrictedObjectsPermissions: ObjectsPermissions = {
    ...objectsPermissions,
  };

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const objectPermissions = objectsPermissions[flatObjectMetadata.id];
    const discoverableFieldMetadataIds = resolveDiscoverableFieldMetadataIds({
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    if (
      !isDefined(objectPermissions) ||
      !isDefined(discoverableFieldMetadataIds)
    ) {
      continue;
    }

    const restrictedFields = { ...objectPermissions.restrictedFields };

    for (const fieldMetadataId of flatObjectMetadata.fieldIds) {
      if (!discoverableFieldMetadataIds.has(fieldMetadataId)) {
        restrictedFields[fieldMetadataId] = {
          ...restrictedFields[fieldMetadataId],
          canRead: false,
        };
      }
    }

    restrictedObjectsPermissions[flatObjectMetadata.id] = {
      ...objectPermissions,
      restrictedFields,
    };
  }

  return restrictedObjectsPermissions;
};
