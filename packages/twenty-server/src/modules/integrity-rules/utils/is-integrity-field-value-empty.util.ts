import { isArray, isString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

const COMPOSITE_MEANINGFUL_SUBFIELDS: Partial<
  Record<FieldMetadataType, string[]>
> = {
  [FieldMetadataType.LINKS]: ['primaryLinkUrl'],
  [FieldMetadataType.CURRENCY]: ['amountMicros'],
  [FieldMetadataType.EMAILS]: ['primaryEmail'],
  [FieldMetadataType.PHONES]: ['primaryPhoneNumber'],
  [FieldMetadataType.FULL_NAME]: ['firstName', 'lastName'],
  [FieldMetadataType.ADDRESS]: ['addressStreet1', 'addressCity'],
  [FieldMetadataType.RICH_TEXT]: ['blocknote', 'markdown'],
  [FieldMetadataType.ACTOR]: ['name'],
};

const isBlank = (value: unknown) =>
  !isDefined(value) || (isString(value) && value.trim() === '');

export const isIntegrityFieldValueEmpty = (
  type: FieldMetadataType,
  value: unknown,
): boolean => {
  const meaningfulSubfields = COMPOSITE_MEANINGFUL_SUBFIELDS[type];

  if (isDefined(meaningfulSubfields)) {
    return (
      !isPlainObject(value) ||
      meaningfulSubfields.every((subfield) => isBlank(value[subfield]))
    );
  }

  if (isArray(value)) {
    return value.length === 0;
  }

  return isBlank(value);
};
