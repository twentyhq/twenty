import { validationRuleEvaluationNow } from '@/utils/validation-rule/internal/validationRuleEvaluationNow';

export const runWithValidationRuleNow = <TResult>({
  now,
  run,
}: {
  now: string;
  run: () => TResult;
}): TResult => {
  const previousNow = validationRuleEvaluationNow.current;

  validationRuleEvaluationNow.current = now;

  try {
    return run();
  } finally {
    validationRuleEvaluationNow.current = previousNow;
  }
};
