import { t } from '@lingui/core/macro';
import { isNonEmptyString, isNumber } from '@sniptt/guards';
import {
  FieldMetadataType,
  type FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import {
  formatToShortNumber,
  isDefined,
  parseToPlainDateOrThrow,
} from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from 'src/modules/dashboard/chart-data/constants/graph-default-date-granularity.constant';
import { formatDateByGranularity } from 'src/modules/dashboard/chart-data/utils/format-date-by-granularity';

type FormatDimensionValueParams = {
  value: unknown;
  fieldMetadata: FlatFieldMetadata;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
  subFieldName?: string;
  userTimezone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
};

const normalizeMultiSelectValue = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return [value];
  }

  const trimmed = value.trim();
  const isPostgresArrayFormat =
    trimmed.startsWith('{') && trimmed.endsWith('}');

  if (!isPostgresArrayFormat) {
    return [value];
  }

  const content = trimmed.slice(1, -1);

  return content ? content.split(',') : [];
};

export const formatDimensionValue = ({
  value,
  fieldMetadata,
  dateGranularity,
  subFieldName,
  userTimezone,
  firstDayOfTheWeek,
}: FormatDimensionValueParams): string => {
  if (!isDefined(value)) {
    return t`Not Set`;
  }

  const effectiveDateGranularity = (dateGranularity ??
    GRAPH_DEFAULT_DATE_GRANULARITY) as ObjectRecordGroupByDateGranularity;

  switch (fieldMetadata.type) {
    case FieldMetadataType.SELECT: {
      const selectedOption = fieldMetadata.options?.find(
        (option) => option.value === value,
      );

      return selectedOption?.label ?? String(value);
    }

    case FieldMetadataType.MULTI_SELECT: {
      const values = normalizeMultiSelectValue(value);

      return values
        .map((value) => {
          const option = fieldMetadata.options?.find(
            (option) => option.value === value,
          );

          return option?.label ?? String(value);
        })
        .join(', ');
    }

    case FieldMetadataType.BOOLEAN: {
      return value === true ? t`Yes` : t`No`;
    }

    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME: {
      if (
        effectiveDateGranularity ===
          ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK ||
        effectiveDateGranularity ===
          ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR ||
        effectiveDateGranularity ===
          ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR
      ) {
        return String(value);
      }

      const parsedPlainDate = parseToPlainDateOrThrow(String(value));

      return formatDateByGranularity(
        parsedPlainDate,
        effectiveDateGranularity,
        userTimezone,
        firstDayOfTheWeek,
      );
    }

    case FieldMetadataType.RELATION: {
      if (isDefined(dateGranularity)) {
        const parsedDayString = String(value);

        if (
          dateGranularity ===
            ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK ||
          dateGranularity ===
            ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR ||
          dateGranularity ===
            ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR
        ) {
          return String(value);
        }

        return parsedDayString;
      }

      return String(value);
    }

    case FieldMetadataType.NUMBER:
    case FieldMetadataType.CURRENCY: {
      if (
        fieldMetadata.type === FieldMetadataType.CURRENCY &&
        subFieldName === 'currencyCode'
      ) {
        if (!isNonEmptyString(value)) {
          return t`Not Set`;
        }

        return String(value);
      }
      const numericValue = isNumber(value) ? value : Number(value);

      if (isNaN(numericValue)) {
        return String(value);
      }

      return formatToShortNumber(numericValue);
    }

    default:
      return String(value);
  }
};
