import { FieldMetadataType } from 'twenty-shared/types';

export const isFieldMetadataEligibleForFieldsWidget = ({
  fieldName,
  fieldType,
  isLabelIdentifierField,
}: {
  fieldName: string;
  fieldType: FieldMetadataType;
  isLabelIdentifierField: boolean;
}): boolean => {
  if (fieldName === 'deletedAt') {
    return false;
  }

  if (fieldType === FieldMetadataType.TS_VECTOR) {
    return false;
  }

  if (fieldType === FieldMetadataType.POSITION) {
    return false;
  }

  if (fieldName === 'id' && !isLabelIdentifierField) {
    return false;
  }

  return true;
};
