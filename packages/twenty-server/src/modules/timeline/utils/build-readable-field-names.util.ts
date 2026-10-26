import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFieldNamesInEventProperties } from 'src/engine/core-modules/record-share/utils/get-field-names-in-event-properties.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildReadableFieldNames = ({
  flatObjectMetadata,
  isLinkedActivity,
  objectsPermissions,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'id' | 'fieldIds'>;
  isLinkedActivity: boolean;
  objectsPermissions: ObjectsPermissions;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): Set<string> => {
  const objectPermissions = objectsPermissions[flatObjectMetadata.id];

  if (isLinkedActivity && objectPermissions?.canReadObjectRecords === false) {
    return new Set();
  }

  const restrictedFields = objectPermissions?.restrictedFields ?? {};

  return new Set(
    flatObjectMetadata.fieldIds.flatMap((fieldId) => {
      const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (
        !isDefined(flatFieldMetadata) ||
        restrictedFields[fieldId]?.canRead === false
      ) {
        return [];
      }

      return getFieldNamesInEventProperties(flatFieldMetadata);
    }),
  );
};
