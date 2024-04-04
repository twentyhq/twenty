import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const fieldMetadataTypeToColumnType = <Type extends FieldMetadataType>(
  fieldMetadataType: Type,
): string => {
  /**
   * Composite types are not implemented here, as they are flattened by their composite definitions.
   * See src/metadata/field-metadata/composite-types for more information.
   */
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
    case FieldMetadataType.POSITION:
      return 'float';
    case FieldMetadataType.BOOLEAN:
      return 'boolean';
    case FieldMetadataType.DATE_TIME:
      return 'timestamptz';
    case FieldMetadataType.RATING:
    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT:
      return 'enum';
    case FieldMetadataType.RAW_JSON:
      return 'jsonb';
    default:
      throw new Error(`Cannot convert ${fieldMetadataType} to column type.`);
  }
};
