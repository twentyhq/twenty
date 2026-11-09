import { isNull } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';

import { DASHBOARD_FILTER_PLAIN_DATE_OPERANDS } from '@/constants/DashboardFilterPlainDateOperands';
import {
  type DashboardFilterFieldResolution,
  type DashboardFilterValue,
  FieldMetadataType,
  type FirstDayOfTheWeek,
  type PageLayoutFilterCondition,
  ViewFilterOperand,
} from '@/types';
import { getValidTimeZoneOrUndefined } from '@/utils/date/getValidTimeZoneOrUndefined';
import { turnPlainDateIntoUserTimeZoneInstantString } from '@/utils/date/turnPlainDateIntoUserTimeZoneInstantString';
import { relativeDateFilterStringifiedSchema } from '@/utils/filter/dates/utils/relativeDateFilterStringifiedSchema';
import { stringifyRelativeDateFilter } from '@/utils/filter/dates/utils/stringifyRelativeDateFilter';
import { type RecordFilter } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { getDashboardFilterConditionValueIssue } from '@/utils/pageLayout/getDashboardFilterConditionValueIssue';
import { InvalidDashboardFilterError } from '@/utils/pageLayout/InvalidDashboardFilterError';
import { resolveDashboardFilterFieldForWidget } from '@/utils/pageLayout/resolveDashboardFilterFieldForWidget';
import { isDefined } from '@/utils/validation/isDefined';

type DashboardRecordFilter = Omit<RecordFilter, 'id'>;

type AppliedDashboardFilterFieldResolution = Extract<
  DashboardFilterFieldResolution,
  { fieldMetadataId: string }
>;

type DashboardFilterAppliedField = {
  pageLayoutFilterId: string;
} & AppliedDashboardFilterFieldResolution;

const isAppliedDashboardFilterFieldResolution = (
  resolution: DashboardFilterFieldResolution,
): resolution is AppliedDashboardFilterFieldResolution =>
  !isNull(resolution.fieldMetadataId);

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
  fieldMetadataId,
  fieldType,
  timeZone,
  firstDayOfTheWeek,
}: {
  condition: PageLayoutFilterCondition;
  fieldMetadataId: string;
  fieldType: FieldMetadataType | undefined;
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
    fieldType !== FieldMetadataType.DATE_TIME
  ) {
    return [{ fieldMetadataId, operand, value }];
  }

  // Half-open wire contract: IS_AFTER day is inclusive, IS_BEFORE day exclusive
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
  groupByFieldMetadataIds,
  widgetFilterFieldMetadataIds,
  fields,
  timeZone,
  firstDayOfTheWeek,
}: Omit<
  Parameters<typeof resolveDashboardFilterFieldForWidget>[0],
  'pageLayoutFilterId' | 'filterType'
> & {
  values: DashboardFilterValue[];
  timeZone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
}): {
  recordFilters: DashboardRecordFilter[];
  appliedFields: DashboardFilterAppliedField[];
  notAppliedPageLayoutFilterIds: string[];
  unresolvedPageLayoutFilterIds: string[];
} => {
  if (!isDefined(getValidTimeZoneOrUndefined(timeZone))) {
    throw new InvalidDashboardFilterError(
      `Dashboard filter time zone "${timeZone}" is not valid`,
    );
  }

  const fieldTypeById = new Map(fields.map(({ id, type }) => [id, type]));

  const recordFilters: DashboardRecordFilter[] = [];
  const appliedFields: DashboardFilterAppliedField[] = [];
  const notAppliedPageLayoutFilterIds: string[] = [];
  const unresolvedPageLayoutFilterIds: string[] = [];

  for (const { pageLayoutFilterId, type, conditions } of values) {
    const resolution = resolveDashboardFilterFieldForWidget({
      pageLayoutFilterId,
      filterType: type,
      bindings,
      groupByFieldMetadataIds,
      widgetFilterFieldMetadataIds,
      fields,
    });

    if (!isAppliedDashboardFilterFieldResolution(resolution)) {
      (resolution.source === 'NOT_APPLIED'
        ? notAppliedPageLayoutFilterIds
        : unresolvedPageLayoutFilterIds
      ).push(pageLayoutFilterId);
      continue;
    }

    const { fieldMetadataId } = resolution;

    appliedFields.push({ pageLayoutFilterId, ...resolution });
    recordFilters.push(
      ...conditions.flatMap((condition) =>
        convertConditionToRecordFilters({
          condition,
          fieldMetadataId,
          fieldType: fieldTypeById.get(fieldMetadataId),
          timeZone,
          firstDayOfTheWeek,
        }),
      ),
    );
  }

  return {
    recordFilters,
    appliedFields,
    notAppliedPageLayoutFilterIds,
    unresolvedPageLayoutFilterIds,
  };
};
