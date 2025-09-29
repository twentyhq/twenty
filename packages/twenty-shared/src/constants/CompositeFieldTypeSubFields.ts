import { FieldMetadataType } from '@/types';

export const COMPOSITE_FIELD_TYPE_SUB_FIELDS = {
  [FieldMetadataType.CURRENCY]: ['amountMicros', 'currencyCode'],
  [FieldMetadataType.EMAILS]: ['primaryEmail', 'additionalEmails'],
  [FieldMetadataType.LINKS]: ['primaryLinkUrl', 'primaryLinkLabel', 'secondaryLinks'],
  [FieldMetadataType.PHONES]: [
    'primaryPhoneCallingCode',
    'primaryPhoneCountryCode',
    'primaryPhoneNumber',
    'additionalPhones',
  ],
  [FieldMetadataType.FULL_NAME]: ['firstName', 'lastName'],
  [FieldMetadataType.ADDRESS]: [
    'addressStreet1',
    'addressStreet2',
    'addressCity',
    'addressState',
    'addressCountry',
    'addressPostcode',
    'addressLat',
    'addressLng',
  ],
  [FieldMetadataType.ACTOR]: ['source', 'name', 'workspaceMemberId', 'context'],
  [FieldMetadataType.RICH_TEXT_V2]: ['blocknote', 'markdown'],
} as const;


