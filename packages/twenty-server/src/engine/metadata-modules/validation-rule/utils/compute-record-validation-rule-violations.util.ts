import {
  type ObjectRecord,
  type ObjectValidationRule,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import { evaluateValidationRuleExpression } from 'twenty-shared/utils';

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
}: {
  records: ObjectRecord[];
  validationRules: Pick<
    ObjectValidationRule,
    'id' | 'expression' | 'message' | 'errorFieldMetadataId'
  >[];
  fields: ValidationRuleFieldDescriptor[];
  now: string;
  inputIndexByRecordId: Map<string, number>;
}): ComputeRecordValidationRuleViolationsResult => {
  const violations: RecordValidationRuleViolation[] = [];
  const evaluationErrors: RecordValidationRuleViolation[] = [];

  for (const record of records) {
    for (const validationRule of validationRules) {
      const evaluationResult = evaluateValidationRuleExpression({
        expression: validationRule.expression,
        record,
        fields,
        now,
      });

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
