import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export function generateDefaultValue(
  type: FieldMetadataType,
): FieldMetadataDefaultValue {
  switch (type) {
    case FieldMetadataType.TEXT:
      return "''";
    case FieldMetadataType.EMAILS:
      return {
        primaryEmail: "''",
        additionalEmails: null,
      };
    case FieldMetadataType.FULL_NAME:
      return {
        firstName: "''",
        lastName: "''",
      };
    case FieldMetadataType.ADDRESS:
      return {
        addressStreet1: "''",
        addressStreet2: "''",
        addressCity: "''",
        addressState: "''",
        addressCountry: "''",
        addressPostcode: "''",
        addressLat: null,
        addressLng: null,
      };
    case FieldMetadataType.CURRENCY:
      return {
        amountMicros: null,
        currencyCode: "''",
      };
    case FieldMetadataType.LINKS:
      return {
        primaryLinkLabel: "''",
        primaryLinkUrl: "''",
        secondaryLinks: "'[]'",
      };
    case FieldMetadataType.PHONES:
      return {
        primaryPhoneNumber: "''",
        primaryPhoneCountryCode: "''",
        additionalPhones: null,
      };
    default:
      return null;
  }
}
