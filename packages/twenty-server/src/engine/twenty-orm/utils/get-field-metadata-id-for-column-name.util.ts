import { FieldMetadataType } from 'twenty-shared/types';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export function getFieldMetadataIdForColumnNameMap(
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
) {
  const columnNameToFieldMetadataIdMap: Record<string, string> = {};

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

        columnNameToFieldMetadataIdMap[columnName] = fieldMetadataId;
      });
    } else {
      const columnName = computeColumnName(fieldMetadata, {
        isForeignKey: fieldMetadata.type === FieldMetadataType.RELATION,
      });

      columnNameToFieldMetadataIdMap[columnName] = fieldMetadataId;
    }
  }

  return columnNameToFieldMetadataIdMap;
}
