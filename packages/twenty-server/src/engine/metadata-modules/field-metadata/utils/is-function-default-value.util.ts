import {
  type FieldMetadataDefaultValueForAnyType,
  type FieldMetadataDefaultValueFunctionNames,
  type FieldMetadataFunctionDefaultValue,
  fieldMetadataDefaultValueFunctionName,
} from 'twenty-shared/types';

export const isFunctionDefaultValue = (
  defaultValue: FieldMetadataDefaultValueForAnyType,
): defaultValue is FieldMetadataFunctionDefaultValue => {
  return (
    typeof defaultValue === 'string' &&
    !defaultValue.startsWith("'") &&
    Object.values(fieldMetadataDefaultValueFunctionName).includes(
      defaultValue as FieldMetadataDefaultValueFunctionNames,
    )
  );
};
