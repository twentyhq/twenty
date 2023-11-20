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
    case FieldMetadataType.DATE_TIME:
      return {
        value: columnName,
      };
    case FieldMetadataType.LINK:
      return {
        label: `${columnName}Label`,
        url: `${columnName}Url`,
      };
    case FieldMetadataType.CURRENCY:
      return {
        amountMicros: `${columnName}AmountMicros`,
        currencyCode: `${columnName}CurrencyCode`,
      };
    case FieldMetadataType.FULL_NAME:
      return {
        firstName: `${columnName}FirstName`,
        lastName: `${columnName}LastName`,
      };

    default:
      throw new BadRequestException(`Unknown type ${type}`);
  }
}
