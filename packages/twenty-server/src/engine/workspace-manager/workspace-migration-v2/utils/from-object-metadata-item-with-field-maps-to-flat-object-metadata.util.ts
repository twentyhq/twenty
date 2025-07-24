import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { FlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { fromObjectMetadataEntityToFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/utils/from-object-metadata-entity-to-flat-object-metadata.util';

export const fromObjectMetadataItemWithFieldMapsToFlatObjectMetadata = (
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
): FlatObjectMetadata => {
  const {
    fieldsById,
    fieldIdByJoinColumnName,
    fieldIdByName,
    indexMetadatas,
    ...rest
  } = objectMetadataItemWithFieldMaps;

  return fromObjectMetadataEntityToFlatObjectMetadata({
    ...rest,
    fields: Object.values(fieldsById),
    indexMetadatas,
  });
};
