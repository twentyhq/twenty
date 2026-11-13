import { compositeTypeDefinitions, FieldMetadataType } from '@/types';
import { getFieldOrSubFieldType } from '@/utils/filter/getFieldOrSubFieldType';

const TEXT_WORKSPACE_MEMBER_FIELD_TYPES = [
  FieldMetadataType.TEXT,
  FieldMetadataType.UUID,
];

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
    case FieldMetadataType.ARRAY:
      return TEXT_WORKSPACE_MEMBER_FIELD_TYPES;
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
    default:
      return compositeTypeDefinitions.has(comparedFieldType)
        ? TEXT_WORKSPACE_MEMBER_FIELD_TYPES
        : [];
  }
};
