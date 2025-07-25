import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromObjectMetadataEntityToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-entity-to-flat-object-metadata.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const fromObjectMetadataItemWithFieldMapsToFlatObjectMetadata = (
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
): FlatObjectMetadata => {
  const {
    fieldsById,
    fieldIdByJoinColumnName: _fieldIdByJoinColumnName,
    fieldIdByName: _fieldIdByName,
    indexMetadatas,
    ...rest
  } = objectMetadataItemWithFieldMaps;

  return fromObjectMetadataEntityToFlatObjectMetadata({
    ...rest,
    fields: Object.values(fieldsById),
    indexMetadatas,
  });
};
