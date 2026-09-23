import { type ValidationRuleEvaluationResult } from '@/types/ValidationRuleEvaluationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { buildValidationRuleEvaluationContext } from '@/utils/validation-rule/buildValidationRuleEvaluationContext';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';

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
}): ValidationRuleEvaluationResult => {
  try {
    const parsedExpression = parseValidationRuleExpression(expression);

    const context = buildValidationRuleEvaluationContext({
      record,
      fields,
      identifierPaths: parsedExpression.variables({ withMembers: true }),
      now,
    });

    const result: unknown = parsedExpression.evaluate(context);

    if (typeof result !== 'boolean') {
      return {
        status: 'errored',
        errorMessage: 'Expression did not return true or false',
      };
    }

    return result ? { status: 'failed' } : { status: 'passed' };
  } catch (error) {
    return {
      status: 'errored',
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
};
