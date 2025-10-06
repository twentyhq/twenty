import { FieldMetadataType } from '@/types';

export const COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES = {
  [FieldMetadataType.CURRENCY]: {
    amountMicros: 'amountMicros',
    currencyCode: 'currencyCode',
  },
  [FieldMetadataType.EMAILS]: {
    primaryEmail: 'primaryEmail',
    additionalEmails: 'additionalEmails',
  },
  [FieldMetadataType.LINKS]: {
    primaryLinkUrl: 'primaryLinkUrl',
    primaryLinkLabel: 'primaryLinkLabel',
    secondaryLinks: 'secondaryLinks',
  },
  [FieldMetadataType.PHONES]: {
    primaryPhoneCallingCode: 'primaryPhoneCallingCode',
    primaryPhoneCountryCode: 'primaryPhoneCountryCode',
    primaryPhoneNumber: 'primaryPhoneNumber',
    additionalPhones: 'additionalPhones',
  },
  [FieldMetadataType.FULL_NAME]: {
    firstName: 'firstName',
    lastName: 'lastName',
  },
  [FieldMetadataType.ADDRESS]: {
    addressStreet1: 'addressStreet1',
    addressStreet2: 'addressStreet2',
    addressCity: 'addressCity',
    addressState: 'addressState',
    addressCountry: 'addressCountry',
    addressPostcode: 'addressPostcode',
    addressLat: 'addressLat',
    addressLng: 'addressLng',
  },
  [FieldMetadataType.ACTOR]: {
    source: 'source',
    name: 'name',
    workspaceMemberId: 'workspaceMemberId',
    context: 'context',
  },
  [FieldMetadataType.RICH_TEXT_V2]: {
    blocknote: 'blocknote',
    markdown: 'markdown',
  },
} as const;
