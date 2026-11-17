import { isString } from '@sniptt/guards';
import { parseToPlainDateOrThrow } from '@/utils/date/parseToPlainDateOrThrow';
import { getValidationRuleNowInUtc } from '@/utils/validation-rule/internal/getValidationRuleNowInUtc';

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
