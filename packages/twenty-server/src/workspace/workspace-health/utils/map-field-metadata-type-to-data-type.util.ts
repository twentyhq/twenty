import { ConflictException } from '@nestjs/common';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export const mapFieldMetadataTypeToDataType = (
  fieldMetadataType: FieldMetadataType,
): string => {
  switch (fieldMetadataType) {
    case FieldMetadataType.UUID:
      return 'uuid';
    case FieldMetadataType.TEXT:
      return 'text';
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL:
      return 'varchar';
    case FieldMetadataType.NUMERIC:
      return 'numeric';
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.PROBABILITY:
      return 'double precision';
    case FieldMetadataType.BOOLEAN:
      return 'boolean';
    case FieldMetadataType.DATE_TIME:
      return 'timestamp';
    case FieldMetadataType.RATING:
    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT:
      return 'enum';
    default:
      throw new ConflictException(
        `Cannot convert ${fieldMetadataType} to data type.`,
      );
  }
};
