import { FieldMetadataType } from 'src/types/FieldMetadataType';

export const isFieldMetadataDate = (fieldMetadataType: FieldMetadataType) => {
  return (
    fieldMetadataType === FieldMetadataType.DATE ||
    fieldMetadataType === FieldMetadataType.DATE_TIME
  );
};
