import {
  FieldMetadataDefaultSerializableValue,
  FieldMetadataFunctionDefaultValue,
} from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { fieldMetadataDefaultValueFunctionName } from 'src/engine/metadata-modules/field-metadata/dtos/default-value.input';

type FieldMetadataDefaultValueFunctionNameUnion =
  (typeof fieldMetadataDefaultValueFunctionName)[keyof typeof fieldMetadataDefaultValueFunctionName];

export const isFunctionDefaultValue = (
  defaultValue: FieldMetadataDefaultSerializableValue,
): defaultValue is FieldMetadataFunctionDefaultValue['value'] => {
  return (
    typeof defaultValue === 'string' &&
    !defaultValue.startsWith("'") &&
    Object.values(fieldMetadataDefaultValueFunctionName).includes(
      defaultValue as FieldMetadataDefaultValueFunctionNameUnion,
    )
  );
};
