import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleEvaluationResult } from '@/types/ValidationRuleEvaluationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { createValidationRuleEvaluator } from '@/utils/validation-rule/createValidationRuleEvaluator';

export const evaluateValidationRuleExpression = ({
  expression,
  bindings,
  record,
  fields,
  now,
}: {
  expression: string;
  bindings: ValidationRuleBindings;
  record: Record<string, unknown>;
  fields: ValidationRuleFieldDescriptor[];
  now: string;
}): ValidationRuleEvaluationResult =>
  createValidationRuleEvaluator({ expression, bindings, fields })({
    record,
    now,
  });
