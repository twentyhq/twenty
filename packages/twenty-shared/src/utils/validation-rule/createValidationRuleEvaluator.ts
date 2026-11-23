import { type ValidationRuleEvaluationResult } from '@/types/ValidationRuleEvaluationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { createExpressionEvaluator } from '@/utils/expression/createExpressionEvaluator';

type ValidationRuleEvaluator = (params: {
  record: Record<string, unknown>;
  previousRecord?: Record<string, unknown>;
  now: string;
}) => ValidationRuleEvaluationResult;

export const createValidationRuleEvaluator = ({
  expression,
  fields,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
}): ValidationRuleEvaluator => {
  const evaluateExpression = createExpressionEvaluator({ expression, fields });

  return (params) => {
    const evaluation = evaluateExpression(params);

    if (evaluation.status === 'errored') {
      return evaluation;
    }

    if (typeof evaluation.value !== 'boolean') {
      return {
        status: 'errored',
        errorMessage: 'Expression did not return true or false',
        errorCode: 'NON_BOOLEAN_RESULT',
      };
    }

    return evaluation.value ? { status: 'passed' } : { status: 'failed' };
  };
};
