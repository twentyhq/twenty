import { Temporal } from 'temporal-polyfill';

import {
  type DashboardFilterBinding,
  type FirstDayOfTheWeek,
  type PageLayoutFilterCondition,
  type PageLayoutFilterValue,
  type PartialFieldMetadataItem,
  ViewFilterOperand,
} from '@/types';
import { turnPlainDateIntoUserTimeZoneInstantString } from '@/utils/date/turnPlainDateIntoUserTimeZoneInstantString';
import { relativeDateFilterStringifiedSchema } from '@/utils/filter/dates/utils/relativeDateFilterStringifiedSchema';
import { stringifyRelativeDateFilter } from '@/utils/filter/dates/utils/stringifyRelativeDateFilter';
import { type RecordFilter } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { getFilterTypeFromFieldType } from '@/utils/filter/utils/getFilterTypeFromFieldType';
import { isDefined } from '@/utils/validation/isDefined';

type DashboardRecordFilter = Omit<RecordFilter, 'id'>;

type DashboardFilterField = Pick<PartialFieldMetadataItem, 'id' | 'type'>;

const MAX_RELATIVE_DATE_AMOUNT = 1000;

// Postgres rejects year 0 and ISO dates with an expanded year
const SUPPORTED_ISO_YEAR_PREFIX = /^(?!0000)\d{4}-/;

const PLAIN_DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

const PLAIN_DATE_OPERANDS = [
  ViewFilterOperand.IS,
  ViewFilterOperand.IS_AFTER,
  ViewFilterOperand.IS_BEFORE,
];

const parsePlainDateOrThrow = (value: string): Temporal.PlainDate => {
  if (
    !PLAIN_DATE_FORMAT.test(value) ||
    !SUPPORTED_ISO_YEAR_PREFIX.test(value)
  ) {
    throw new Error(
      `Dashboard filter date "${value}" is not a YYYY-MM-DD date between years 0001 and 9999`,
    );
  }

  return Temporal.PlainDate.from(value);
};

const parseRelativeDateOrThrow = (value: string) => {
  const relativeDateFilter =
    relativeDateFilterStringifiedSchema.safeParse(value);

  if (!relativeDateFilter.success) {
    throw new Error(`Dashboard filter value "${value}" is not a relative date`);
  }

  if ((relativeDateFilter.data.amount ?? 1) > MAX_RELATIVE_DATE_AMOUNT) {
    throw new Error(
      `Dashboard filter relative date "${value}" exceeds the maximum amount of ${MAX_RELATIVE_DATE_AMOUNT}`,
    );
  }

  return relativeDateFilter.data;
};

const turnPlainDateIntoInstantStringOrThrow = ({
  plainDate,
  timeZone,
}: {
  plainDate: Temporal.PlainDate;
  timeZone: string;
}) => {
  const instantString = turnPlainDateIntoUserTimeZoneInstantString(
    plainDate,
    timeZone,
  );

  if (!SUPPORTED_ISO_YEAR_PREFIX.test(instantString)) {
    throw new Error(
      `Dashboard filter date "${plainDate}" is out of range in time zone "${timeZone}"`,
    );
  }

  return instantString;
};

const convertConditionToRecordFilters = ({
  condition: { operand, value },
  field: { id: fieldMetadataId, type: fieldType },
  timeZone,
  firstDayOfTheWeek,
}: {
  condition: PageLayoutFilterCondition;
  field: DashboardFilterField;
  timeZone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
}): DashboardRecordFilter[] => {
  if (operand === ViewFilterOperand.IS_RELATIVE) {
    const relativeDateFilter = parseRelativeDateOrThrow(value);

    return [
      {
        fieldMetadataId,
        operand,
        value: stringifyRelativeDateFilter({
          ...relativeDateFilter,
          timezone: timeZone,
          firstDayOfTheWeek:
            relativeDateFilter.firstDayOfTheWeek ?? firstDayOfTheWeek,
        }),
      },
    ];
  }

  if (!PLAIN_DATE_OPERANDS.includes(operand)) {
    return [{ fieldMetadataId, operand, value }];
  }

  const plainDate = parsePlainDateOrThrow(value);

  if (getFilterTypeFromFieldType(fieldType) !== 'DATE_TIME') {
    return [{ fieldMetadataId, operand, value }];
  }

  const startOfDay = turnPlainDateIntoInstantStringOrThrow({
    plainDate,
    timeZone,
  });

  if (operand !== ViewFilterOperand.IS) {
    return [{ fieldMetadataId, operand, value: startOfDay }];
  }

  return [
    {
      fieldMetadataId,
      operand: ViewFilterOperand.IS_AFTER,
      value: startOfDay,
    },
    {
      fieldMetadataId,
      operand: ViewFilterOperand.IS_BEFORE,
      value: turnPlainDateIntoInstantStringOrThrow({
        plainDate: plainDate.add({ days: 1 }),
        timeZone,
      }),
    },
  ];
};

// Convert the record filters to a gql filter in the same timeZone: IS_TODAY resolves in it
export const buildDashboardFilterForWidget = ({
  values,
  bindings,
  fields,
  timeZone,
  firstDayOfTheWeek,
}: {
  values: Record<string, PageLayoutFilterValue>;
  bindings: DashboardFilterBinding[] | null | undefined;
  fields: DashboardFilterField[];
  timeZone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
}): {
  recordFilters: DashboardRecordFilter[];
  unresolvedBindings: DashboardFilterBinding[];
} => {
  const fieldById = new Map(fields.map((field) => [field.id, field]));

  const boundValues = (bindings ?? []).flatMap((binding) => {
    const value = values[binding.pageLayoutFilterId];

    return isDefined(value) ? [{ binding, value }] : [];
  });

  const recordFilters = boundValues.flatMap(({ binding, value }) => {
    const field = fieldById.get(binding.fieldMetadataId);

    if (!isDefined(field)) {
      return [];
    }

    return value.conditions.flatMap((condition) =>
      convertConditionToRecordFilters({
        condition,
        field,
        timeZone,
        firstDayOfTheWeek,
      }),
    );
  });

  return {
    recordFilters,
    unresolvedBindings: boundValues
      .map(({ binding }) => binding)
      .filter(({ fieldMetadataId }) => !fieldById.has(fieldMetadataId)),
  };
};
