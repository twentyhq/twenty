import { Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isFieldMetadataDateKind,
  isFieldMetadataNumericKind,
} from 'twenty-shared/utils';

import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';

const parseDate = (
  rawValue: RawDimensionValue | undefined,
  fieldType?: FieldMetadataType,
): Temporal.PlainDate | null => {
  if (!isDefined(rawValue)) {
    return null;
  }

  const stringValue = String(rawValue);

  return fieldType === FieldMetadataType.DATE
    ? Temporal.PlainDate.from(stringValue)
    : Temporal.Instant.from(stringValue)
        .toZonedDateTimeISO('UTC')
        .toPlainDate();
};

type CompareDimensionValuesParams = {
  rawValueA: RawDimensionValue | undefined;
  rawValueB: RawDimensionValue | undefined;
  formattedValueA: string;
  formattedValueB: string;
  direction: 'ASC' | 'DESC';
  fieldType?: FieldMetadataType;
  subFieldName?: string;
};

export const compareDimensionValues = ({
  rawValueA,
  rawValueB,
  formattedValueA,
  formattedValueB,
  direction,
  fieldType,
  subFieldName,
}: CompareDimensionValuesParams): number => {
  const applyDirection = (comparison: number) =>
    direction === 'ASC' ? comparison : -comparison;

  if (isDefined(fieldType)) {
    if (isFieldMetadataDateKind(fieldType)) {
      const dateA = parseDate(rawValueA, fieldType);
      const dateB = parseDate(rawValueB, fieldType);

      if (isDefined(dateA) && isDefined(dateB)) {
        return applyDirection(Temporal.PlainDate.compare(dateA, dateB));
      }
    }

    if (fieldType === FieldMetadataType.CURRENCY) {
      if (subFieldName === 'amountMicros') {
        if (isDefined(rawValueA) && isDefined(rawValueB)) {
          return applyDirection(Number(rawValueA) - Number(rawValueB));
        }
      }

      return applyDirection(formattedValueA.localeCompare(formattedValueB));
    }

    if (isFieldMetadataNumericKind(fieldType)) {
      if (isDefined(rawValueA) && isDefined(rawValueB)) {
        return applyDirection(Number(rawValueA) - Number(rawValueB));
      }
    }
  }

  return applyDirection(formattedValueA.localeCompare(formattedValueB));
};
