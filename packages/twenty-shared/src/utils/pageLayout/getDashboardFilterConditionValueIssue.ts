import { DASHBOARD_FILTER_PLAIN_DATE_OPERANDS } from '@/constants/DashboardFilterPlainDateOperands';
import { DASHBOARD_FILTER_RELATIVE_DATE_AMOUNT_MAX } from '@/constants/DashboardFilterRelativeDateAmountMax';
import { type PageLayoutFilterCondition, ViewFilterOperand } from '@/types';
import { isSubDayRelativeDateFilterUnit } from '@/utils/filter/dates/utils/isSubDayRelativeDateFilterUnit';
import { relativeDateFilterStringifiedSchema } from '@/utils/filter/dates/utils/relativeDateFilterStringifiedSchema';
import { plainDateFilterValueSchema } from '@/utils/filter/utils/validation-schemas/filterValueScalarSchemas';

const SUPPORTED_PLAIN_DATE_FORMAT = /^(?!0000)\d{4}-\d{2}-\d{2}$/;

const getRelativeDateIssue = (value: string): string | undefined => {
  const relativeDateFilter =
    relativeDateFilterStringifiedSchema.safeParse(value);

  if (!relativeDateFilter.success) {
    return 'Expected a relative date such as "PAST_30_DAY".';
  }

  if (
    (relativeDateFilter.data.amount ?? 1) >
    DASHBOARD_FILTER_RELATIVE_DATE_AMOUNT_MAX
  ) {
    return `Expected a relative date amount of at most ${DASHBOARD_FILTER_RELATIVE_DATE_AMOUNT_MAX}.`;
  }

  // A dashboard filter can bind a DATE field, where a sub-day range is empty
  if (isSubDayRelativeDateFilterUnit(relativeDateFilter.data.unit)) {
    return 'Expected a relative date unit of a day or longer.';
  }

  return undefined;
};

export const getDashboardFilterConditionValueIssue = ({
  operand,
  value,
}: PageLayoutFilterCondition): string | undefined => {
  if (operand === ViewFilterOperand.IS_RELATIVE) {
    return getRelativeDateIssue(value);
  }

  if (!DASHBOARD_FILTER_PLAIN_DATE_OPERANDS.includes(operand)) {
    return undefined;
  }

  const isSupportedPlainDate =
    SUPPORTED_PLAIN_DATE_FORMAT.test(value) &&
    plainDateFilterValueSchema.safeParse(value).success;

  return isSupportedPlainDate
    ? undefined
    : 'Expected a YYYY-MM-DD date between years 0001 and 9999.';
};
