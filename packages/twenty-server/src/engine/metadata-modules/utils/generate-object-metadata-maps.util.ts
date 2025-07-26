import omit from 'lodash.omit';
import { FieldMetadataType } from 'twenty-shared/types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export const generateObjectMetadataMaps = (
  objectMetadataCollection: ObjectMetadataEntity[],
): ObjectMetadataMaps => {
  const objectMetadataMaps: ObjectMetadataMaps = {
    byId: {},
    idByNameSingular: {},
  };

  for (const objectMetadata of objectMetadataCollection) {
    const fieldIdByJoinColumnNameMap: Record<string, string> = {};

    for (const fieldMetadata of objectMetadata.fields) {
      if (
        isFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.RELATION)
      ) {
        if (fieldMetadata.settings?.joinColumnName) {
          fieldIdByJoinColumnNameMap[fieldMetadata.settings.joinColumnName] =
            fieldMetadata.id;
        }
      }
    }

    const fieldsByIdMap = objectMetadata.fields.reduce((acc, field) => {
      acc[field.id] = field;

      return acc;
    }, {} as FieldMetadataMap);

    const processedObjectMetadata: ObjectMetadataItemWithFieldMaps = {
      ...omit(objectMetadata, 'fields'),
      fieldsById: fieldsByIdMap,
      fieldIdByName: Object.fromEntries(
        Object.entries(fieldsByIdMap).map(([id, field]) => [field.name, id]),
      ),
      fieldIdByJoinColumnName: fieldIdByJoinColumnNameMap,
    };

    objectMetadataMaps.byId[objectMetadata.id] = processedObjectMetadata;
    objectMetadataMaps.idByNameSingular[objectMetadata.nameSingular] =
      objectMetadata.id;
  }

  return objectMetadataMaps;
};
