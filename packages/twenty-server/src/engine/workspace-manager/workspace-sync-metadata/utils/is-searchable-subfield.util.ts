import { FieldMetadataType } from 'twenty-shared/types';
export const isSearchableSubfield = (
  compositeFieldMetadataType: FieldMetadataType,
  subFieldMetadataType: FieldMetadataType,
  subFieldName: string,
) => {
  if (subFieldMetadataType !== FieldMetadataType.TEXT) {
    return false;
  }

  switch (compositeFieldMetadataType) {
    case FieldMetadataType.RICH_TEXT_V2:
      return ['markdown'].includes(subFieldName);
    case FieldMetadataType.PHONES:
      return ['primaryPhoneNumber', 'primaryPhoneCallingCode'].includes(
        subFieldName,
      );
    default:
      return true;
  }
};
