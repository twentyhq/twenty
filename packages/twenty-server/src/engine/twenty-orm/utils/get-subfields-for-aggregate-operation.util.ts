import { FieldMetadataType } from 'twenty-shared';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

export const getSubfieldsForAggregateOperation = (
  fieldType: FieldMetadataType,
): string[] | undefined => {
  if (!isCompositeFieldMetadataType(fieldType)) {
    return undefined;
  } else {
    switch (fieldType) {
      case FieldMetadataType.CURRENCY:
        return ['amountMicros', 'currencyCode'];
      case FieldMetadataType.FULL_NAME:
        return ['firstName', 'lastName'];
      case FieldMetadataType.ADDRESS:
        return [
          'addressStreet1',
          'addressStreet2',
          'addressCity',
          'addressPostcode',
          'addressState',
          'addressCountry',
          'addressLat',
          'addressLng',
        ];
      case FieldMetadataType.LINKS:
        return ['primaryLinkUrl'];
      case FieldMetadataType.ACTOR:
        return ['workspaceMemberId', 'source'];
      case FieldMetadataType.EMAILS:
        return ['primaryEmail'];
      case FieldMetadataType.PHONES:
        return [
          'primaryPhoneNumber',
          'primaryPhoneCountryCode',
          'primaryPhoneCallingCode',
        ];
      default:
        throw new Error(`Unsupported composite field type: ${fieldType}`);
    }
  }
};
