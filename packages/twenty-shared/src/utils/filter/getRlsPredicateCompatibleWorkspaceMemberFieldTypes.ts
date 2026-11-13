import { compositeTypeDefinitions, FieldMetadataType } from '@/types';
import { getFieldOrSubFieldType } from '@/utils/filter/getFieldOrSubFieldType';

// Mirrors what the field's view filter takes: one value of its own type, or several for select and relation fields
export const getRlsPredicateCompatibleWorkspaceMemberFieldTypes = ({
  fieldType,
  subFieldName,
}: {
  fieldType: FieldMetadataType;
  subFieldName?: string | null;
}): FieldMetadataType[] => {
  const comparedFieldType = getFieldOrSubFieldType({ fieldType, subFieldName });

  switch (comparedFieldType) {
    case FieldMetadataType.TEXT:
    case FieldMetadataType.BOOLEAN:
    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME:
      return [comparedFieldType];
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
      return [FieldMetadataType.NUMBER, FieldMetadataType.NUMERIC];
    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT:
      return [FieldMetadataType.SELECT, FieldMetadataType.MULTI_SELECT];
    case FieldMetadataType.UUID:
    case FieldMetadataType.RELATION:
    case FieldMetadataType.MORPH_RELATION:
      return [
        FieldMetadataType.RELATION,
        FieldMetadataType.UUID,
        FieldMetadataType.ARRAY,
      ];
    case FieldMetadataType.ARRAY:
      return [FieldMetadataType.TEXT];
    default:
      return compositeTypeDefinitions.has(comparedFieldType)
        ? [FieldMetadataType.TEXT]
        : [];
  }
};
