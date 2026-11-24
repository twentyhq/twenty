import {
  isBoolean,
  isNonEmptyString,
  isNumber,
  isObject,
} from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type FormattableField = Pick<FlatFieldMetadata, 'type' | 'options'>;

const toRecord = (value: unknown): Record<string, unknown> =>
  isObject(value) && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const joinNonEmpty = (values: unknown[], separator = ', '): string | null => {
  const strings = values
    .filter(isNonEmptyString)
    .map((value) => value.trim())
    .filter(isNonEmptyString);

  return strings.length > 0 ? strings.join(separator) : null;
};

const getOptionLabel = (
  field: FormattableField,
  value: unknown,
): string | null => {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const optionLabel = toArray(field.options)
    .map(toRecord)
    .find((option) => option.value === value)?.label;

  return isNonEmptyString(optionLabel) ? optionLabel : value;
};

const formatCurrency = (value: unknown): string | null => {
  const { amountMicros, currencyCode } = toRecord(value);
  const amount = isNumber(amountMicros)
    ? amountMicros
    : isNonEmptyString(amountMicros)
      ? Number(amountMicros)
      : NaN;

  if (!Number.isFinite(amount)) {
    return null;
  }

  return joinNonEmpty([String(amount / 1_000_000), currencyCode], ' ');
};

const formatPhones = (value: unknown): string | null => {
  const { primaryPhoneCallingCode, primaryPhoneNumber, additionalPhones } =
    toRecord(value);

  return joinNonEmpty([
    joinNonEmpty([primaryPhoneCallingCode, primaryPhoneNumber], ' '),
    ...toArray(additionalPhones).map((phone) => {
      const { callingCode, number } = toRecord(phone);

      return joinNonEmpty([callingCode, number], ' ');
    }),
  ]);
};

export const formatAiSearchAnswerFieldValue = ({
  field,
  value,
}: {
  field: FormattableField;
  value: unknown;
}): string | null => {
  if (!isDefined(value)) {
    return null;
  }

  switch (field.type) {
    case FieldMetadataType.TEXT:
    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME:
      return isNonEmptyString(value) ? value.trim() || null : null;
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
      return isNumber(value) || isNonEmptyString(value) ? String(value) : null;
    case FieldMetadataType.BOOLEAN:
      return isBoolean(value) ? String(value) : null;
    case FieldMetadataType.SELECT:
    case FieldMetadataType.RATING:
      return getOptionLabel(field, value);
    case FieldMetadataType.MULTI_SELECT:
      return joinNonEmpty(
        toArray(value).map((item) => getOptionLabel(field, item)),
      );
    case FieldMetadataType.ARRAY:
      return joinNonEmpty(toArray(value));
    case FieldMetadataType.CURRENCY:
      return formatCurrency(value);
    case FieldMetadataType.EMAILS: {
      const { primaryEmail, additionalEmails } = toRecord(value);

      return joinNonEmpty([primaryEmail, ...toArray(additionalEmails)]);
    }
    case FieldMetadataType.PHONES:
      return formatPhones(value);
    case FieldMetadataType.LINKS: {
      const { primaryLinkUrl, secondaryLinks } = toRecord(value);

      return joinNonEmpty([
        primaryLinkUrl,
        ...toArray(secondaryLinks).map((link) => toRecord(link).url),
      ]);
    }
    case FieldMetadataType.FULL_NAME: {
      const { firstName, lastName } = toRecord(value);

      return joinNonEmpty([firstName, lastName], ' ');
    }
    case FieldMetadataType.ADDRESS: {
      const {
        addressStreet1,
        addressStreet2,
        addressCity,
        addressState,
        addressPostcode,
        addressCountry,
      } = toRecord(value);

      return joinNonEmpty([
        addressStreet1,
        addressStreet2,
        addressCity,
        addressState,
        addressPostcode,
        addressCountry,
      ]);
    }
    case FieldMetadataType.RICH_TEXT: {
      const { markdown } = toRecord(value);

      return isNonEmptyString(markdown) ? markdown.trim() || null : null;
    }
    default:
      return null;
  }
};
