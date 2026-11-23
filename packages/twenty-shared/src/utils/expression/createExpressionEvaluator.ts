import { type Expression } from 'expr-eval-fork';

import { type ExpressionEvaluationResult } from '@/types/ExpressionEvaluationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { CustomError } from '@/utils/errors/CustomError';
import { buildValidationRuleEvaluationContext } from '@/utils/validation-rule/buildValidationRuleEvaluationContext';
import { runWithValidationRuleNow } from '@/utils/validation-rule/internal/runWithValidationRuleNow';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';

type ExpressionEvaluator = (params: {
  record: Record<string, unknown>;
  previousRecord?: Record<string, unknown>;
  now: string;
}) => ExpressionEvaluationResult;

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const parseExpression = (
  expression: string,
):
  | { isValid: true; parsedExpression: Expression }
  | { isValid: false; errorMessage: string } => {
  try {
    return {
      isValid: true,
      parsedExpression: parseValidationRuleExpression(expression),
    };
  } catch (error) {
    return { isValid: false, errorMessage: toErrorMessage(error) };
  }
};

export const createExpressionEvaluator = ({
  expression,
  fields,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
}): ExpressionEvaluator => {
  const parsing = parseExpression(expression);

  if (!parsing.isValid) {
    const { errorMessage } = parsing;

    return () => ({ status: 'errored', errorMessage });
  }

  const { parsedExpression } = parsing;

  const identifierPaths = parsedExpression.variables({ withMembers: true });
  const fieldByName = new Map(fields.map((field) => [field.name, field]));

  return ({ record, previousRecord, now }) => {
    try {
      const value: unknown = runWithValidationRuleNow({
        now,
        run: () =>
          parsedExpression.evaluate(
            buildValidationRuleEvaluationContext({
              record,
              previousRecord,
              fieldByName,
              identifierPaths,
              now,
            }),
          ),
      });

      return { status: 'evaluated', value };
    } catch (error) {
      if (
        error instanceof CustomError &&
        (error.code === 'INVALID_DATE_UNIT' ||
          error.code === 'INVALID_DATE_PART')
      ) {
        return {
          status: 'errored',
          errorMessage: error.message,
          errorCode: error.code,
        };
      }

      return { status: 'errored', errorMessage: toErrorMessage(error) };
    }
  };
};
