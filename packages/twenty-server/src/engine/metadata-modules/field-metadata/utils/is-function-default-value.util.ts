import {
  type FieldMetadataDefaultSerializableValue,
  type FieldMetadataFunctionDefaultValue,
  type FieldMetadataDefaultValueFunctionNames,
  fieldMetadataDefaultValueFunctionName,
} from 'twenty-shared/types';

export const isFunctionDefaultValue = (
  defaultValue: FieldMetadataDefaultSerializableValue,
): defaultValue is FieldMetadataFunctionDefaultValue => {
  return (
    typeof defaultValue === 'string' &&
    !defaultValue.startsWith("'") &&
    Object.values(fieldMetadataDefaultValueFunctionName).includes(
      defaultValue as FieldMetadataDefaultValueFunctionNames,
    )
  );
};
