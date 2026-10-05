import { type Expression } from 'expr-eval-fork';

import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleEvaluationIdentifierPath } from '@/types/ValidationRuleEvaluationIdentifierPath';
import { type ValidationRuleEvaluationResult } from '@/types/ValidationRuleEvaluationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { buildValidationRuleEvaluationContext } from '@/utils/validation-rule/buildValidationRuleEvaluationContext';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';
import { resolveValidationRuleIdentifierPath } from '@/utils/validation-rule/resolveValidationRuleIdentifierPath';

type ValidationRuleEvaluator = (params: {
  record: Record<string, unknown>;
  now: string;
}) => ValidationRuleEvaluationResult;

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const createValidationRuleEvaluator = ({
  expression,
  bindings,
  fields,
}: {
  expression: string;
  bindings: ValidationRuleBindings;
  fields: ValidationRuleFieldDescriptor[];
}): ValidationRuleEvaluator => {
  let parsedExpression: Expression;

  try {
    parsedExpression = parseValidationRuleExpression(expression);
  } catch (error) {
    const errorMessage = toErrorMessage(error);

    return () => ({ status: 'errored', errorMessage });
  }

  const identifierPaths: ValidationRuleEvaluationIdentifierPath[] = [];

  for (const path of parsedExpression.variables({ withMembers: true })) {
    const resolution = resolveValidationRuleIdentifierPath({
      path,
      fields,
      bindings,
      acceptsFieldNames: false,
    });

    if (!resolution.isResolved) {
      const { errorMessage } = resolution;

      return () => ({ status: 'errored', errorMessage });
    }

    identifierPaths.push({
      segments: path.split('.'),
      resolvedPath: resolution.resolvedPath,
    });
  }

  return ({ record, now }) => {
    try {
      const result: unknown = parsedExpression.evaluate(
        buildValidationRuleEvaluationContext({
          record,
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
