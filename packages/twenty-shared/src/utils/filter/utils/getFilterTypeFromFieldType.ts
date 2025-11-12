import {
  FieldMetadataType,
  type FilterableAndTSVectorFieldType,
} from '@/types';

export const getFilterTypeFromFieldType = (
  fieldType: FieldMetadataType,
): FilterableAndTSVectorFieldType => {
  switch (fieldType) {
    case FieldMetadataType.DATE_TIME:
      return 'DATE_TIME';
    case FieldMetadataType.DATE:
      return 'DATE';
    case FieldMetadataType.LINKS:
      return 'LINKS';
    case FieldMetadataType.FULL_NAME:
      return 'FULL_NAME';
    case FieldMetadataType.NUMBER:
      return 'NUMBER';
    case FieldMetadataType.CURRENCY:
      return 'CURRENCY';
    case FieldMetadataType.EMAILS:
      return 'EMAILS';
    case FieldMetadataType.PHONES:
      return 'PHONES';
    case FieldMetadataType.RELATION:
      return 'RELATION';
    case FieldMetadataType.SELECT:
      return 'SELECT';
    case FieldMetadataType.MULTI_SELECT:
      return 'MULTI_SELECT';
    case FieldMetadataType.ADDRESS:
      return 'ADDRESS';
    case FieldMetadataType.RATING:
      return 'RATING';
    case FieldMetadataType.ACTOR:
      return 'ACTOR';
    case FieldMetadataType.ARRAY:
      return 'ARRAY';
    case FieldMetadataType.RAW_JSON:
      return 'RAW_JSON';
    case FieldMetadataType.BOOLEAN:
      return 'BOOLEAN';
    case FieldMetadataType.TS_VECTOR:
      return 'TS_VECTOR';
    case FieldMetadataType.UUID:
      return 'UUID';
    default:
      return 'TEXT';
  }
};
