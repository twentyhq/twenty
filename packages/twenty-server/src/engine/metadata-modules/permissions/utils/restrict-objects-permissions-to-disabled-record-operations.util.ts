import { type ObjectsPermissions } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const restrictObjectsPermissionsToDisabledRecordOperations = ({
  objectsPermissions,
  flatObjectMetadataMaps,
}: {
  objectsPermissions: ObjectsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): ObjectsPermissions =>
  Object.fromEntries(
    Object.entries(objectsPermissions).map(
      ([objectMetadataId, objectPermissions]) => {
        const disabledRecordOperations = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        })?.disabledRecordOperations;

        if (!isNonEmptyArray(disabledRecordOperations)) {
          return [objectMetadataId, objectPermissions];
        }

        return [
          objectMetadataId,
          {
            ...objectPermissions,
            canReadObjectRecords:
              objectPermissions.canReadObjectRecords &&
              !disabledRecordOperations.includes('read'),
            canUpdateObjectRecords:
              objectPermissions.canUpdateObjectRecords &&
              !disabledRecordOperations.includes('update'),
            canSoftDeleteObjectRecords:
              objectPermissions.canSoftDeleteObjectRecords &&
              !disabledRecordOperations.includes('softDelete'),
            canDestroyObjectRecords:
              objectPermissions.canDestroyObjectRecords &&
              !disabledRecordOperations.includes('destroy'),
          },
        ];
      },
    ),
  );
