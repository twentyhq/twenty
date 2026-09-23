import { VALIDATION_RULE_EXPRESSION_MAX_LENGTH } from '@/constants/ValidationRuleExpressionMaxLength';
import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleCompilationResult } from '@/types/ValidationRuleCompilationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { evaluateValidationRuleExpression } from '@/utils/validation-rule/evaluateValidationRuleExpression';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';
import { resolveValidationRuleIdentifierPath } from '@/utils/validation-rule/resolveValidationRuleIdentifierPath';

export const compileValidationRuleExpression = ({
  expression,
  fields,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
}): ValidationRuleCompilationResult => {
  if (expression.trim().length === 0) {
    return { isValid: false, errorMessage: 'Expression is empty' };
  }

  if (expression.length > VALIDATION_RULE_EXPRESSION_MAX_LENGTH) {
    return {
      isValid: false,
      errorMessage: `Expression is longer than ${VALIDATION_RULE_EXPRESSION_MAX_LENGTH} characters`,
    };
  }

  let identifierPaths: string[];

  try {
    identifierPaths = parseValidationRuleExpression(expression).variables({
      withMembers: true,
    });
  } catch (error) {
    return {
      isValid: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  let bindings: ValidationRuleBindings = {};

  for (const path of identifierPaths) {
    const resolution = resolveValidationRuleIdentifierPath({ path, fields });

    if (!resolution.isResolved) {
      return { isValid: false, errorMessage: resolution.errorMessage };
    }

    bindings = { ...bindings, ...resolution.bindings };
  }

  const emptyRecordEvaluation = evaluateValidationRuleExpression({
    expression,
    record: {},
    fields,
    now: new Date().toISOString(),
  });

  if (emptyRecordEvaluation.status === 'errored') {
    return { isValid: false, errorMessage: emptyRecordEvaluation.errorMessage };
  }

  return { isValid: true, bindings };
};
