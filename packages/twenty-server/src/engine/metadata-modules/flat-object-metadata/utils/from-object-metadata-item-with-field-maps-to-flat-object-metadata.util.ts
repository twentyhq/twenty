import { fromCachedFieldMetadataEntityToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-cached-field-metadata-entity-to-flat-field-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { CachedFieldMetadataEntity } from 'src/engine/metadata-modules/types/cached-field-metadata-entity';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

type FromObjectMetadataItemWithFieldMapsToFlatObjectMetadataArgs = {
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  objectMetadataMaps: ObjectMetadataMaps;
};
export const fromObjectMetadataItemWithFieldMapsToFlatObjectMetadata = ({
  objectMetadataItemWithFieldMaps,
  objectMetadataMaps,
}: FromObjectMetadataItemWithFieldMapsToFlatObjectMetadataArgs): FlatObjectMetadata => {
  const {
    fieldsById,
    fieldIdByJoinColumnName: _fieldIdByJoinColumnName,
    fieldIdByName: _fieldIdByName,
    indexMetadatas,
    ...rest
  } = objectMetadataItemWithFieldMaps;

  const cachedFieldMetadataEntities =
    Object.values<CachedFieldMetadataEntity>(fieldsById);

  const flatFieldMetadatas = cachedFieldMetadataEntities.map(
    (cachedFieldMetadataEntity) =>
      fromCachedFieldMetadataEntityToFlatFieldMetadata({
        cachedFieldMetadataEntity,
        objectMetadataMaps,
      }),
  );

  return {
    ...rest,
    flatFieldMetadatas,
    uniqueIdentifier: rest.standardId ?? rest.id,
    flatIndexMetadatas: [],
  };
};
