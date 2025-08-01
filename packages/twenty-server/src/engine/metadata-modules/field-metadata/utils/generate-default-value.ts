import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';

// No need to refactor as unused in workspace migration v2
export function generateDefaultValue(
  type: FieldMetadataType,
): FieldMetadataDefaultValue {
  switch (type) {
    case FieldMetadataType.TEXT:
      return "''" satisfies FieldMetadataDefaultValue<FieldMetadataType.TEXT>;
    case FieldMetadataType.EMAILS:
      return {
        primaryEmail: "''",
        additionalEmails: null,
      } satisfies FieldMetadataDefaultValue<FieldMetadataType.EMAILS>;
    case FieldMetadataType.FULL_NAME:
      return {
        firstName: "''",
        lastName: "''",
      } satisfies FieldMetadataDefaultValue<FieldMetadataType.FULL_NAME>;
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
      } satisfies FieldMetadataDefaultValue<FieldMetadataType.ADDRESS>;
    case FieldMetadataType.CURRENCY:
      return {
        amountMicros: null,
        currencyCode: "''",
      } satisfies FieldMetadataDefaultValue<FieldMetadataType.CURRENCY>;
    case FieldMetadataType.LINKS:
      return {
        primaryLinkLabel: "''",
        primaryLinkUrl: "''",
        secondaryLinks: null,
      } satisfies FieldMetadataDefaultValue<FieldMetadataType.LINKS>;
    case FieldMetadataType.PHONES:
      return {
        primaryPhoneNumber: "''",
        primaryPhoneCountryCode: "''",
        primaryPhoneCallingCode: "''",
        additionalPhones: null,
      } satisfies FieldMetadataDefaultValue<FieldMetadataType.PHONES>;
    case FieldMetadataType.ACTOR:
      return {
        source: `'${FieldActorSource.MANUAL}'`,
        name: "'System'",
        workspaceMemberId: null,
      } satisfies FieldMetadataDefaultValue<FieldMetadataType.ACTOR>;
    default:
      return null;
  }
}
