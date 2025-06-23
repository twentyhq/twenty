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
    const fieldIdByJoinColumnNameMap: Record<string, string> = {};

    for (const fieldMetadata of objectMetadata.fields) {
      if (
        isFieldMetadataInterfaceOfType(
          fieldMetadata,
          FieldMetadataType.RELATION,
        )
      ) {
        if (fieldMetadata.settings?.joinColumnName) {
          fieldIdByJoinColumnNameMap[fieldMetadata.settings.joinColumnName] =
            fieldMetadata.id;
        }
      }
    }

    const fieldIdByNameMap: Record<string, string> =
      objectMetadata.fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: field.id,
        }),
        {} as Record<string, string>,
      );

    const processedObjectMetadata: ObjectMetadataItemWithFieldMaps = {
      ...objectMetadata,
      fieldsById: fieldsByIdMap,
      fieldIdByName: fieldIdByNameMap,
      fieldIdByJoinColumnName: fieldIdByJoinColumnNameMap,
    };

    objectMetadataMaps.byId[objectMetadata.id] = processedObjectMetadata;
    objectMetadataMaps.idByNameSingular[objectMetadata.nameSingular] =
      objectMetadata.id;
  }

  return objectMetadataMaps;
};
