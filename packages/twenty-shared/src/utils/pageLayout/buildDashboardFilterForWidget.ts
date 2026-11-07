import { Temporal } from 'temporal-polyfill';

import { DASHBOARD_FILTER_PLAIN_DATE_OPERANDS } from '@/constants/DashboardFilterPlainDateOperands';
import {
  type DashboardFilterBinding,
  type FirstDayOfTheWeek,
  type PageLayoutFilterCondition,
  type PageLayoutFilterValue,
  type PartialFieldMetadataItem,
  ViewFilterOperand,
} from '@/types';
import { getValidTimeZoneOrUndefined } from '@/utils/date/getValidTimeZoneOrUndefined';
import { turnPlainDateIntoUserTimeZoneInstantString } from '@/utils/date/turnPlainDateIntoUserTimeZoneInstantString';
import { relativeDateFilterStringifiedSchema } from '@/utils/filter/dates/utils/relativeDateFilterStringifiedSchema';
import { stringifyRelativeDateFilter } from '@/utils/filter/dates/utils/stringifyRelativeDateFilter';
import { type RecordFilter } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { getFilterTypeFromFieldType } from '@/utils/filter/utils/getFilterTypeFromFieldType';
import { getDashboardFilterConditionValueIssue } from '@/utils/pageLayout/getDashboardFilterConditionValueIssue';
import { InvalidDashboardFilterError } from '@/utils/pageLayout/InvalidDashboardFilterError';
import { isDefined } from '@/utils/validation/isDefined';

type DashboardRecordFilter = Omit<RecordFilter, 'id'>;

type DashboardFilterField = Pick<PartialFieldMetadataItem, 'id' | 'type'>;

// Postgres rejects year 0 and ISO dates with an expanded year
const SUPPORTED_ISO_YEAR_PREFIX = /^(?!0000)\d{4}-/;

const turnPlainDateIntoInstantStringOrThrow = ({
  plainDate,
  timeZone,
  value,
}: {
  plainDate: Temporal.PlainDate;
  timeZone: string;
  value: string;
}) => {
  const instantString = turnPlainDateIntoUserTimeZoneInstantString(
    plainDate,
    timeZone,
  );

  if (!SUPPORTED_ISO_YEAR_PREFIX.test(instantString)) {
    throw new InvalidDashboardFilterError(
      `Dashboard filter date "${value}" is out of range in time zone "${timeZone}"`,
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
  const issue = getDashboardFilterConditionValueIssue({ operand, value });

  if (isDefined(issue)) {
    throw new InvalidDashboardFilterError(
      `Dashboard filter value "${value}" is not valid for operand "${operand}". ${issue}`,
    );
  }

  if (operand === ViewFilterOperand.IS_RELATIVE) {
    const relativeDateFilter = relativeDateFilterStringifiedSchema.parse(value);

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

  if (
    !DASHBOARD_FILTER_PLAIN_DATE_OPERANDS.includes(operand) ||
    getFilterTypeFromFieldType(fieldType) !== 'DATE_TIME'
  ) {
    return [{ fieldMetadataId, operand, value }];
  }

  const plainDate = Temporal.PlainDate.from(value);

  const startOfDay = turnPlainDateIntoInstantStringOrThrow({
    plainDate,
    timeZone,
    value,
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
        value,
      }),
    },
  ];
};

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
  if (!isDefined(getValidTimeZoneOrUndefined(timeZone))) {
    throw new InvalidDashboardFilterError(
      `Dashboard filter time zone "${timeZone}" is not valid`,
    );
  }

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
