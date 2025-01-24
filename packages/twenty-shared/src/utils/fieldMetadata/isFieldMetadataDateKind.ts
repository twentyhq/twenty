import { FieldMetadataType } from 'src/types/FieldMetadataType';

export const isFieldMetadataDateKind = (
  fieldMetadataType?: FieldMetadataType,
): fieldMetadataType is
  | FieldMetadataType.DATE
  | FieldMetadataType.DATE_TIME => {
  return (
    fieldMetadataType === FieldMetadataType.DATE ||
    fieldMetadataType === FieldMetadataType.DATE_TIME
  );
};
