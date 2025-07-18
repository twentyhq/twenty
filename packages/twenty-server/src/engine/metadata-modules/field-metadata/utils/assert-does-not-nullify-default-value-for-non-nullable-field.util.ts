import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

export const assertDoesNotNullifyDefaultValueForNonNullableField = ({
  isNullable,
  defaultValueFromUpdate,
}: {
  isNullable: boolean | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValueFromUpdate?: any;
}) => {
  if (!isNullable && defaultValueFromUpdate === null) {
    throw new FieldMetadataException(
      'Default value cannot be nullified for non-nullable field',
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }
};
