import { isString } from '@sniptt/guards';
import { parseToPlainDateOrThrow } from '@/utils/date/parseToPlainDateOrThrow';
import { getValidationRuleNowInUtc } from '@/utils/validation-rule/validationRuleEvaluationClock';

// Whole UTC calendar days from the date to today, negative for a future date
export const computeValidationRuleDaysSince = (
  value: unknown,
): number | null => {
  if (!isString(value)) {
    return null;
  }

  try {
    const today = getValidationRuleNowInUtc().toPlainDate();

    return parseToPlainDateOrThrow(value).until(today, { largestUnit: 'days' })
      .days;
  } catch {
    return null;
  }
};
