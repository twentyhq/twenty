import { FieldMetadataType } from 'src/types/FieldMetadataType';
import { getSubfieldForAggregateOperation } from 'src/utils/aggregateOperations/getSubFieldForAggregateOperation.util';
import { isCompositeFieldMetadataType } from 'src/utils/aggregateOperations/isCompositeFieldMetadataType.util';
import { capitalize } from 'src/utils/strings/capitalize';

export const getColumnNameForAggregateOperation = (
  fieldName: string,
  fieldType: FieldMetadataType,
) => {
  if (!isCompositeFieldMetadataType(fieldType)) {
    return fieldName;
  }

  return `${fieldName}${capitalize(getSubfieldForAggregateOperation(fieldType) as string)}`;
};
