import { FieldMetadataType } from 'twenty-shared/types';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { isFieldMetadataInterfaceOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export const generateObjectMetadataMaps = (
  objectMetadataCollection: ObjectMetadataInterface[],
): ObjectMetadataMaps => {
  const objectMetadataMaps: ObjectMetadataMaps = {
    byId: {},
    idByNameSingular: {},
  };

  for (const objectMetadata of objectMetadataCollection) {
    const fieldsByIdMap: FieldMetadataMap = {};
    const fieldsByNameMap: FieldMetadataMap = {};
    const fieldsByJoinColumnNameMap: FieldMetadataMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      if (
        isFieldMetadataInterfaceOfType(
          fieldMetadata,
          FieldMetadataType.RELATION,
        )
      ) {
        if (fieldMetadata.settings?.joinColumnName) {
          fieldsByJoinColumnNameMap[fieldMetadata.settings.joinColumnName] =
            fieldMetadata;
        }
      }

      fieldsByNameMap[fieldMetadata.name] = fieldMetadata;
      fieldsByIdMap[fieldMetadata.id] = fieldMetadata;
    }

    const processedObjectMetadata: ObjectMetadataItemWithFieldMaps = {
      ...objectMetadata,
      fieldsById: fieldsByIdMap,
      fieldsByName: fieldsByNameMap,
      fieldsByJoinColumnName: fieldsByJoinColumnNameMap,
    };

    objectMetadataMaps.byId[objectMetadata.id] = processedObjectMetadata;
    objectMetadataMaps.idByNameSingular[objectMetadata.nameSingular] =
      objectMetadata.id;
  }

  return objectMetadataMaps;
};
