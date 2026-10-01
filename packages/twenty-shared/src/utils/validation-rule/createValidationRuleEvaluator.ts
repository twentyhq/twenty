import { type Expression } from 'expr-eval-fork';

import { type ValidationRuleEvaluationResult } from '@/types/ValidationRuleEvaluationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { buildValidationRuleEvaluationContext } from '@/utils/validation-rule/buildValidationRuleEvaluationContext';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';

type ValidationRuleEvaluator = (params: {
  record: Record<string, unknown>;
  now: string;
}) => ValidationRuleEvaluationResult;

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const createValidationRuleEvaluator = ({
  expression,
  fields,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
}): ValidationRuleEvaluator => {
  let parsedExpression: Expression;

  try {
    parsedExpression = parseValidationRuleExpression(expression);
  } catch (error) {
    const errorMessage = toErrorMessage(error);

    return () => ({ status: 'errored', errorMessage });
  }

  const identifierPaths = parsedExpression.variables({ withMembers: true });
  const fieldByName = new Map(fields.map((field) => [field.name, field]));

  return ({ record, now }) => {
    try {
      const result: unknown = parsedExpression.evaluate(
        buildValidationRuleEvaluationContext({
          record,
          fieldByName,
          identifierPaths,
          now,
        }),
      );

      if (typeof result !== 'boolean') {
        return {
          status: 'errored',
          errorMessage: 'Expression did not return true or false',
        };
      }

      return result ? { status: 'passed' } : { status: 'failed' };
    } catch (error) {
      return { status: 'errored', errorMessage: toErrorMessage(error) };
    }
  };
};
