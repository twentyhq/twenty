import { Temporal } from 'temporal-polyfill';
import {
  FieldMetadataType,
  type ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import {
  isDefined,
  isFieldMetadataDateKind,
  isFieldMetadataNumericKind,
} from 'twenty-shared/utils';

import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { isCyclicalDateGranularity } from 'src/modules/dashboard/chart-data/utils/is-cyclical-date-granularity.util';

const parseDate = (
  rawValue: RawDimensionValue | undefined,
): Temporal.PlainDate | null => {
  if (!isDefined(rawValue)) {
    return null;
  }

  const stringValue = String(rawValue);

  return Temporal.PlainDate.from(stringValue);
};

type CompareDimensionValuesParams = {
  rawValueA: RawDimensionValue | undefined;
  rawValueB: RawDimensionValue | undefined;
  formattedValueA: string;
  formattedValueB: string;
  direction: 'ASC' | 'DESC';
  fieldType?: FieldMetadataType;
  subFieldName?: string;
  dateGranularity?: ObjectRecordGroupByDateGranularity | null;
};

export const compareDimensionValues = ({
  rawValueA,
  rawValueB,
  formattedValueA,
  formattedValueB,
  direction,
  fieldType,
  subFieldName,
  dateGranularity,
}: CompareDimensionValuesParams): number => {
  const applyDirection = (comparison: number) =>
    direction === 'ASC' ? comparison : -comparison;

  if (isDefined(fieldType)) {
    if (
      isFieldMetadataDateKind(fieldType) &&
      !isCyclicalDateGranularity(dateGranularity)
    ) {
      const dateA = parseDate(rawValueA);
      const dateB = parseDate(rawValueB);

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
