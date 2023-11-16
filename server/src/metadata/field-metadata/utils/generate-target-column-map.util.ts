import { BadRequestException } from '@nestjs/common';

import { FieldMetadataTargetColumnMap } from 'src/metadata/field-metadata/interfaces/field-metadata-target-column-map.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

/**
 * Generate a target column map for a given type, this is used to map the field to the correct column(s) in the database.
 * This is used to support fields that map to multiple columns in the database.
 *
 * @param type string
 * @returns FieldMetadataTargetColumnMap
 */
export function generateTargetColumnMap(
  type: FieldMetadataType,
  isCustomField: boolean,
  fieldName: string,
): FieldMetadataTargetColumnMap {
  const columnName = isCustomField ? `_${fieldName}` : fieldName;

  switch (type) {
    case FieldMetadataType.TEXT:
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL:
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.PROBABILITY:
    case FieldMetadataType.BOOLEAN:
    case FieldMetadataType.DATE:
      return {
        value: columnName,
      };
    case FieldMetadataType.URL:
      return {
        text: `${columnName}_text`,
        link: `${columnName}_link`,
      };
    case FieldMetadataType.MONEY:
      return {
        amount: `${columnName}_amount`,
        currency: `${columnName}_currency`,
      };
    default:
      throw new BadRequestException(`Unknown type ${type}`);
  }
}
