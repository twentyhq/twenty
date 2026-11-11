import { type Expression } from 'expr-eval-fork';

import { type ValidationRuleEvaluationResult } from '@/types/ValidationRuleEvaluationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { isDefined } from '@/utils/validation/isDefined';
import { resolveInput } from '@/utils/variable-resolver';
import { buildValidationRuleEvaluationContext } from '@/utils/validation-rule/buildValidationRuleEvaluationContext';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';
import { replaceValidationRuleVariables } from '@/utils/validation-rule/internal/replaceValidationRuleVariables';
import { runWithValidationRuleNow } from '@/utils/validation-rule/internal/runWithValidationRuleNow';

type ValidationRuleEvaluator = (params: {
  record: Record<string, unknown>;
  previousRecord?: Record<string, unknown>;
  now: string;
  // The workflow run context {{stepId.path}} variables are read from
  variableContext?: Record<string, unknown>;
}) => ValidationRuleEvaluationResult;

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const createValidationRuleEvaluator = ({
  expression,
  fields,
  allowsVariables = false,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
  allowsVariables?: boolean;
}): ValidationRuleEvaluator => {
  const { source, variableByIdentifier } = allowsVariables
    ? replaceValidationRuleVariables(expression)
    : { source: expression, variableByIdentifier: new Map<string, string>() };
  let parsedExpression: Expression;

  try {
    parsedExpression = parseValidationRuleExpression(source);
  } catch (error) {
    const errorMessage = toErrorMessage(error);

    return () => ({ status: 'errored', errorMessage });
  }

  const fieldPaths = parsedExpression
    .variables({ withMembers: true })
    .filter((path) => !variableByIdentifier.has(path.split('.')[0] ?? ''));
  const fieldByName = new Map(fields.map((field) => [field.name, field]));

  return ({ record, previousRecord, now, variableContext = {} }) => {
    try {
      const context = buildValidationRuleEvaluationContext({
        record,
        previousRecord,
        fieldByName,
        identifierPaths: fieldPaths,
        now,
      });

      // Read as the legacy step filters read their operands
      for (const [identifier, variable] of variableByIdentifier) {
        const value = resolveInput(variable, variableContext);

        context[identifier] = isDefined(value) ? value : null;
      }

      const result: unknown = runWithValidationRuleNow({
        now,
        run: () => parsedExpression.evaluate(context),
      });

      if (typeof result !== 'boolean') {
        return {
          status: 'errored',
          errorMessage: 'Expression did not return true or false',
          errorCode: 'NON_BOOLEAN_RESULT',
        };
      }

      return result ? { status: 'passed' } : { status: 'failed' };
    } catch (error) {
      return { status: 'errored', errorMessage: toErrorMessage(error) };
    }
  };
};
