import { FieldMetadataType } from '@/types/FieldMetadataType';

export const VALIDATION_RULE_EMPTINESS_SUBFIELDS_BY_COMPOSITE_TYPE: Partial<
  Record<FieldMetadataType, string[]>
> = {
  [FieldMetadataType.CURRENCY]: ['amountMicros'],
  [FieldMetadataType.FULL_NAME]: ['firstName', 'lastName'],
  [FieldMetadataType.LINKS]: ['primaryLinkUrl'],
  [FieldMetadataType.EMAILS]: ['primaryEmail'],
  [FieldMetadataType.PHONES]: ['primaryPhoneNumber'],
  [FieldMetadataType.RICH_TEXT]: ['markdown', 'blocknote'],
};
