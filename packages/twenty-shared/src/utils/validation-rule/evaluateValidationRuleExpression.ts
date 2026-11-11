import { type ValidationRuleEvaluationResult } from '@/types/ValidationRuleEvaluationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { createValidationRuleEvaluator } from '@/utils/validation-rule/createValidationRuleEvaluator';

export const evaluateValidationRuleExpression = ({
  expression,
  record,
  previousRecord,
  fields,
  now,
  allowsVariables,
  variableContext,
}: {
  expression: string;
  record: Record<string, unknown>;
  previousRecord?: Record<string, unknown>;
  fields: ValidationRuleFieldDescriptor[];
  now: string;
  allowsVariables?: boolean;
  variableContext?: Record<string, unknown>;
}): ValidationRuleEvaluationResult =>
  createValidationRuleEvaluator({ expression, fields, allowsVariables })({
    record,
    previousRecord,
    now,
    variableContext,
  });
