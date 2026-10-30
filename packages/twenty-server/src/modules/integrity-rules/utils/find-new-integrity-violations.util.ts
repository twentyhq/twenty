import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type IntegrityRule } from 'src/modules/integrity-rules/types/integrity-rule.type';
import { type IntegrityRuleField } from 'src/modules/integrity-rules/types/integrity-rule-field.type';
import { type IntegrityViolation } from 'src/modules/integrity-rules/types/integrity-violation.type';
import { evaluateIntegrityRules } from 'src/modules/integrity-rules/utils/evaluate-integrity-rules.util';

// Records that already broke a rule before this write stay editable; only a
// write that adds a violation is rejected.
export const findNewIntegrityViolations = ({
  rules,
  fieldsByName,
  previousRecord,
  record,
}: {
  rules: IntegrityRule[];
  fieldsByName: Record<string, IntegrityRuleField>;
  previousRecord?: Partial<ObjectRecord>;
  record: Partial<ObjectRecord>;
}): IntegrityViolation[] => {
  const violations = evaluateIntegrityRules({
    rules,
    fieldsByName,
    previousRecord,
    record,
  });

  if (!isDefined(previousRecord)) {
    return violations;
  }

  const previousViolations = evaluateIntegrityRules({
    rules,
    fieldsByName,
    record: previousRecord,
  });

  return violations.filter((violation) => {
    const previousViolation = previousViolations.find(
      ({ ruleKey }) => ruleKey === violation.ruleKey,
    );

    return (
      !isDefined(previousViolation) ||
      violation.fields.some(
        (fieldName) => !previousViolation.fields.includes(fieldName),
      )
    );
  });
};
