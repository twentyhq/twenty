import {
  type FieldMetadataDefaultSerializableValue,
  type FieldMetadataFunctionDefaultValue,
} from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import {
  type FieldMetadataDefaultValueFunctionNames,
  fieldMetadataDefaultValueFunctionName,
} from 'src/engine/metadata-modules/field-metadata/dtos/default-value.input';

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
