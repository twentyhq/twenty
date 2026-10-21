import { type ValidationRuleEvaluationResult } from '@/types/ValidationRuleEvaluationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { createValidationRuleEvaluator } from '@/utils/validation-rule/createValidationRuleEvaluator';

export const evaluateValidationRuleExpression = ({
  expression,
  record,
  fields,
  now,
}: {
  expression: string;
  record: Record<string, unknown>;
  fields: ValidationRuleFieldDescriptor[];
  now: string;
}): ValidationRuleEvaluationResult =>
  createValidationRuleEvaluator({ expression, fields })({ record, now });
