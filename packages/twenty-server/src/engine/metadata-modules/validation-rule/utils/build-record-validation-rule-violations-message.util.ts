import { type RecordValidationRuleViolation } from 'src/engine/metadata-modules/validation-rule/types/record-validation-rule-violation.type';

export const buildRecordValidationRuleViolationsMessage = (
  violations: Pick<RecordValidationRuleViolation, 'message'>[],
): string =>
  [...new Set(violations.map((violation) => violation.message))].join('; ');
