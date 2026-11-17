import { Temporal } from 'temporal-polyfill';

import { validationRuleEvaluationNow } from '@/utils/validation-rule/internal/validationRuleEvaluationNow';
import { isDefined } from '@/utils/validation/isDefined';

export const getValidationRuleNowInUtc = (): Temporal.ZonedDateTime =>
  isDefined(validationRuleEvaluationNow.current)
    ? Temporal.Instant.from(
        validationRuleEvaluationNow.current,
      ).toZonedDateTimeISO('UTC')
    : Temporal.Now.zonedDateTimeISO('UTC');
