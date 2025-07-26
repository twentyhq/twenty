import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export function getFieldMetadataIdToColumnNamesMap(
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
) {
  const fieldMetadataToColumnNamesMap = new Map<string, string[]>();

  for (const [fieldMetadataId, fieldMetadata] of Object.entries(
    objectMetadataItemWithFieldMaps.fieldsById,
  )) {
    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

      if (!compositeType) {
        throw new InternalServerError(
          `Composite type not found for field metadata type ${fieldMetadata.type}`,
        );
      }

      compositeType.properties.forEach((compositeProperty) => {
        const columnName = computeCompositeColumnName(
          fieldMetadata.name,
          compositeProperty,
        );

        const existingColumns =
          fieldMetadataToColumnNamesMap.get(fieldMetadataId) ?? [];

        fieldMetadataToColumnNamesMap.set(fieldMetadataId, [
          ...existingColumns,
          columnName,
        ]);
      });
    } else {
      const columnName = computeColumnName(fieldMetadata);

      fieldMetadataToColumnNamesMap.set(fieldMetadataId, [columnName]);
    }
  }

  return fieldMetadataToColumnNamesMap;
}
