import { FieldMetadataType, RelationType } from '@/types';

const RECORD_FORM_SUPPORTED_FIELD_TYPES: readonly FieldMetadataType[] = [
  FieldMetadataType.ADDRESS,
  FieldMetadataType.ARRAY,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.EMAILS,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.LINKS,
  FieldMetadataType.MORPH_RELATION,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.PHONES,
  FieldMetadataType.RAW_JSON,
  FieldMetadataType.RELATION,
  FieldMetadataType.RICH_TEXT,
  FieldMetadataType.SELECT,
  FieldMetadataType.TEXT,
  FieldMetadataType.UUID,
];

export const isFieldMetadataEligibleForRecordForm = ({
  fieldName,
  fieldType,
  isActive,
  isSystem,
  isUIEditable,
  relationType,
}: {
  fieldName: string;
  fieldType: FieldMetadataType;
  isActive: boolean;
  isSystem: boolean;
  isUIEditable: boolean;
  relationType?: RelationType | null;
}): boolean => {
  if (!isActive || isSystem || !isUIEditable) {
    return false;
  }

  if (fieldName === 'id') {
    return false;
  }

  if (!RECORD_FORM_SUPPORTED_FIELD_TYPES.includes(fieldType)) {
    return false;
  }

  const isRelationField =
    fieldType === FieldMetadataType.RELATION ||
    fieldType === FieldMetadataType.MORPH_RELATION;

  if (isRelationField && relationType !== RelationType.MANY_TO_ONE) {
    return false;
  }

  return true;
};
