import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsForObject } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-for-object.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const buildObjectMetadataItemWithFieldMaps = (
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>,
): ObjectMetadataItemWithFieldMaps => {
  const fieldsById: Record<string, FlatFieldMetadata> = {};

  for (const fieldId of flatObjectMetadata.fieldMetadataIds) {
    const field = flatFieldMetadataMaps.byId[fieldId];

    if (isDefined(field)) {
      fieldsById[fieldId] = field;
    }
  }

  const { fieldIdByName, fieldIdByJoinColumnName } = buildFieldMapsForObject(
    flatFieldMetadataMaps,
    flatObjectMetadata.id,
  );

  const indexMetadatas = flatObjectMetadata.indexMetadataIds
    .map((indexId) => flatIndexMaps.byId[indexId])
    .filter(isDefined)
    .map((flatIndex) => ({
      ...flatIndex,
      indexFieldMetadatas: flatIndex.flatIndexFieldMetadatas,
    }));

  return {
    ...flatObjectMetadata,
    fieldsById,
    fieldIdByName,
    fieldIdByJoinColumnName,
    indexMetadatas,
  } as unknown as ObjectMetadataItemWithFieldMaps;
};
