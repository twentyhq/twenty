import { FlatObjectMetadataWithoutFields } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { fromObjectMetadataEntityToFlatObjectMetadataWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/from-object-metadata-entity-to-flat-object-metadata-without-fields.util';

export const fromObjectMetadataItemWithFieldMapsToFlatObjectMetadataWithoutFields =
  (
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ): FlatObjectMetadataWithoutFields => {
    const {
      fieldsById: _fieldsById,
      fieldIdByJoinColumnName: _fieldIdByJoinColumnName,
      fieldIdByName: _fieldIdByName,
      indexMetadatas,
      ...rest
    } = objectMetadataItemWithFieldMaps;

    return fromObjectMetadataEntityToFlatObjectMetadataWithoutFields({
      ...rest,
      fields: [],
      indexMetadatas,
    });
  };
