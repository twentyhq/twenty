import {
  type ObjectRecord,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import { evaluateValidationRuleExpression } from 'twenty-shared/utils';

import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { type RecordValidationRuleViolation } from 'src/engine/metadata-modules/validation-rule/types/record-validation-rule-violation.type';

type ComputeRecordValidationRuleViolationsResult = {
  violations: RecordValidationRuleViolation[];
  evaluationErrors: RecordValidationRuleViolation[];
};

export const computeRecordValidationRuleViolations = ({
  records,
  flatValidationRules,
  fields,
  now,
  inputIndexByRecordId,
}: {
  records: ObjectRecord[];
  flatValidationRules: Pick<
    FlatValidationRule,
    'id' | 'expression' | 'message' | 'errorFieldMetadataId'
  >[];
  fields: ValidationRuleFieldDescriptor[];
  now: string;
  inputIndexByRecordId: Map<string, number>;
}): ComputeRecordValidationRuleViolationsResult => {
  const violations: RecordValidationRuleViolation[] = [];
  const evaluationErrors: RecordValidationRuleViolation[] = [];

  for (const record of records) {
    for (const flatValidationRule of flatValidationRules) {
      const evaluationResult = evaluateValidationRuleExpression({
        expression: flatValidationRule.expression,
        record,
        fields,
        now,
      });

      if (evaluationResult.status === 'passed') {
        continue;
      }

      const violation: RecordValidationRuleViolation = {
        ruleId: flatValidationRule.id,
        message: flatValidationRule.message,
        fieldMetadataId: flatValidationRule.errorFieldMetadataId,
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
