import { type COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES } from '@/constants/CompositeFieldTypeSubFieldsNames';
import { FieldMetadataType } from '@/types/FieldMetadataType';

export const COMPOSITE_FIELD_SUB_FIELD_LABELS: {
  [key in keyof typeof COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES]: Record<
    string,
    string
  >;
} = {
  [FieldMetadataType.CURRENCY]: {
    amountMicros: 'Amount',
    currencyCode: 'Currency',
  },
  [FieldMetadataType.EMAILS]: {
    primaryEmail: 'Primary Email',
    additionalEmails: 'Additional Emails',
  },
  [FieldMetadataType.LINKS]: {
    primaryLinkLabel: 'Link Label',
    primaryLinkUrl: 'Link URL',
    secondaryLinks: 'Secondary Links',
  },
  [FieldMetadataType.PHONES]: {
    primaryPhoneNumber: 'Primary Phone Number',
    primaryPhoneCountryCode: 'Primary Phone Country Code',
    primaryPhoneCallingCode: 'Primary Phone Calling Code',
    additionalPhones: 'Additional Phones',
  },
  [FieldMetadataType.FULL_NAME]: {
    firstName: 'First Name',
    lastName: 'Last Name',
  },
  [FieldMetadataType.ADDRESS]: {
    addressStreet1: 'Address 1',
    addressStreet2: 'Address 2',
    addressCity: 'City',
    addressState: 'State',
    addressCountry: 'Country',
    addressPostcode: 'Post Code',
    addressLat: 'Latitude',
    addressLng: 'Longitude',
  },
  [FieldMetadataType.ACTOR]: {
    source: 'Source',
    name: 'Name',
    workspaceMemberId: 'Workspace Member',
    context: 'Context',
  },
  [FieldMetadataType.RICH_TEXT]: {
    blocknote: 'BlockNote',
    markdown: 'Markdown',
  },
};
