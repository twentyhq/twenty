import { FieldMetadataType } from '@/types/FieldMetadataType';

export type SpreadsheetImportCompositeSubField = {
  subFieldName: string;
  isImportable: boolean;
  isIncludedInUniqueConstraint: boolean;
};

// Order drives the order of the sub-fields offered in column matching.
export const SPREADSHEET_IMPORT_COMPOSITE_SUB_FIELDS = {
  [FieldMetadataType.CURRENCY]: [
    {
      subFieldName: 'amountMicros',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
    {
      subFieldName: 'currencyCode',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
  ],
  [FieldMetadataType.EMAILS]: [
    {
      subFieldName: 'primaryEmail',
      isImportable: true,
      isIncludedInUniqueConstraint: true,
    },
    {
      subFieldName: 'additionalEmails',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
  ],
  [FieldMetadataType.LINKS]: [
    {
      subFieldName: 'primaryLinkUrl',
      isImportable: true,
      isIncludedInUniqueConstraint: true,
    },
    {
      subFieldName: 'primaryLinkLabel',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
    {
      subFieldName: 'secondaryLinks',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
  ],
  [FieldMetadataType.PHONES]: [
    {
      subFieldName: 'primaryPhoneCallingCode',
      isImportable: true,
      isIncludedInUniqueConstraint: true,
    },
    {
      subFieldName: 'primaryPhoneCountryCode',
      isImportable: true,
      isIncludedInUniqueConstraint: true,
    },
    {
      subFieldName: 'primaryPhoneNumber',
      isImportable: true,
      isIncludedInUniqueConstraint: true,
    },
    {
      subFieldName: 'additionalPhones',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
  ],
  [FieldMetadataType.FULL_NAME]: [
    {
      subFieldName: 'firstName',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
    {
      subFieldName: 'lastName',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
  ],
  [FieldMetadataType.ADDRESS]: [
    {
      subFieldName: 'addressStreet1',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
    {
      subFieldName: 'addressStreet2',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
    {
      subFieldName: 'addressCity',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
    {
      subFieldName: 'addressState',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
    {
      subFieldName: 'addressCountry',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
    {
      subFieldName: 'addressPostcode',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
    {
      subFieldName: 'addressLat',
      isImportable: false,
      isIncludedInUniqueConstraint: false,
    },
    {
      subFieldName: 'addressLng',
      isImportable: false,
      isIncludedInUniqueConstraint: false,
    },
  ],
  [FieldMetadataType.ACTOR]: [
    {
      subFieldName: 'source',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
    {
      subFieldName: 'name',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
    {
      subFieldName: 'workspaceMemberId',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
    {
      subFieldName: 'context',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
  ],
  [FieldMetadataType.RICH_TEXT]: [
    {
      subFieldName: 'blocknote',
      isImportable: false,
      isIncludedInUniqueConstraint: false,
    },
    {
      subFieldName: 'markdown',
      isImportable: true,
      isIncludedInUniqueConstraint: false,
    },
  ],
} as const satisfies Partial<
  Record<FieldMetadataType, readonly SpreadsheetImportCompositeSubField[]>
>;
