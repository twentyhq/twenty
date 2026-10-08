import {
  type ObjectRecord,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import { createValidationRuleEvaluator } from 'twenty-shared/utils';

import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { type RecordValidationRuleViolation } from 'src/engine/metadata-modules/validation-rule/types/record-validation-rule-violation.type';

type ComputeRecordValidationRuleViolationsResult = {
  violations: RecordValidationRuleViolation[];
  evaluationErrors: RecordValidationRuleViolation[];
};

export const computeRecordValidationRuleViolations = ({
  records,
  validationRules,
  fields,
  now,
  inputIndexByRecordId,
  maxViolations,
}: {
  records: ObjectRecord[];
  validationRules: Pick<
    FlatValidationRule,
    'id' | 'expression' | 'message' | 'errorFieldMetadataId'
  >[];
  fields: ValidationRuleFieldDescriptor[];
  now: string;
  inputIndexByRecordId: Map<string, number>;
  maxViolations: number;
}): ComputeRecordValidationRuleViolationsResult => {
  const violations: RecordValidationRuleViolation[] = [];
  const evaluationErrors: RecordValidationRuleViolation[] = [];

  const ruleEvaluators = validationRules.map((validationRule) => ({
    validationRule,
    evaluate: createValidationRuleEvaluator({
      expression: validationRule.expression,
      fields,
    }),
  }));

  for (const record of records) {
    for (const { validationRule, evaluate } of ruleEvaluators) {
      if (violations.length + evaluationErrors.length >= maxViolations) {
        return { violations, evaluationErrors };
      }

      const evaluationResult = evaluate({ record, now });

      if (evaluationResult.status === 'passed') {
        continue;
      }

      const violation: RecordValidationRuleViolation = {
        ruleId: validationRule.id,
        message: validationRule.message,
        fieldMetadataId: validationRule.errorFieldMetadataId,
        recordId: String(record.id),
        inputIndex: inputIndexByRecordId.get(String(record.id)) ?? null,
      };

      if (evaluationResult.status === 'failed') {
        violations.push(violation);
      } else {
        evaluationErrors.push(violation);
      }
    }
  }

  return { violations, evaluationErrors };
};
