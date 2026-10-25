import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isNonEmptyString,
  isPlainObject,
} from 'twenty-shared/utils';

import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';
import { canonicalizePersonHandle } from 'src/modules/match-participant/person-handle-field/utils/canonicalize-person-handle.util';

type CanonicalPersonHandles = {
  primary: string[];
  additional: string[];
};

type RawPersonHandles = {
  primary: (string | null)[];
  additional: (string | null)[];
};

const toRecord = (value: unknown): Record<string, unknown> =>
  isPlainObject(value) ? value : {};

const toList = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const toStringOrNull = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

const toPhoneValue = (phone: Record<string, unknown>): string | null => {
  const number = toStringOrNull(phone.number);

  return isNonEmptyString(number)
    ? `${toStringOrNull(phone.callingCode) ?? ''}${number}`
    : null;
};

// person records come from events and raw queries, so composite values are read defensively
const getRawPersonHandles = ({
  type,
  value,
}: {
  type: PersonHandleField['type'];
  value: unknown;
}): RawPersonHandles => {
  const record = toRecord(value);

  switch (type) {
    case FieldMetadataType.EMAILS:
      return {
        primary: [toStringOrNull(record.primaryEmail)],
        additional: toList(record.additionalEmails).map(toStringOrNull),
      };
    case FieldMetadataType.PHONES:
      return {
        primary: [
          toPhoneValue({
            number: record.primaryPhoneNumber,
            callingCode: record.primaryPhoneCallingCode,
          }),
        ],
        additional: toList(record.additionalPhones).map((phone) =>
          toPhoneValue(toRecord(phone)),
        ),
      };
    case FieldMetadataType.LINKS:
      return {
        primary: [toStringOrNull(record.primaryLinkUrl)],
        additional: toList(record.secondaryLinks).map((link) =>
          toStringOrNull(toRecord(link).url),
        ),
      };
    case FieldMetadataType.TEXT:
      return { primary: [toStringOrNull(value)], additional: [] };
  }
};

export const getCanonicalPersonHandles = ({
  type,
  value,
}: {
  type: PersonHandleField['type'];
  value: unknown;
}): CanonicalPersonHandles => {
  const { primary, additional } = getRawPersonHandles({ type, value });

  const canonicalize = (values: (string | null)[]) =>
    values
      .map((rawValue) => canonicalizePersonHandle({ type, value: rawValue }))
      .filter(isDefined);

  return {
    primary: canonicalize(primary),
    additional: canonicalize(additional),
  };
};
