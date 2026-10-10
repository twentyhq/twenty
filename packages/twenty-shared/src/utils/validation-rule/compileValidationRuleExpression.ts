import { type Expression } from 'expr-eval-fork';

import { VALIDATION_RULE_EXPRESSION_MAX_LENGTH } from '@/constants/ValidationRuleExpressionMaxLength';
import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleCompilationResult } from '@/types/ValidationRuleCompilationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { hasValidationRuleBracketAccess } from '@/utils/validation-rule/hasValidationRuleBracketAccess';
import { evaluateValidationRuleExpression } from '@/utils/validation-rule/evaluateValidationRuleExpression';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';
import { resolveValidationRuleIdentifierPath } from '@/utils/validation-rule/resolveValidationRuleIdentifierPath';
import { tokenizeValidationRuleExpression } from '@/utils/validation-rule/tokenizeValidationRuleExpression';

export const compileValidationRuleExpression = ({
  expression,
  fields,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
}): ValidationRuleCompilationResult => {
  if (expression.trim().length === 0) {
    return {
      isValid: false,
      errorMessage: 'Expression is empty',
      errorCode: 'EMPTY_EXPRESSION',
    };
  }

  if (expression.length > VALIDATION_RULE_EXPRESSION_MAX_LENGTH) {
    return {
      isValid: false,
      errorMessage: `Expression is longer than ${VALIDATION_RULE_EXPRESSION_MAX_LENGTH} characters`,
      errorCode: 'EXPRESSION_TOO_LONG',
      errorParams: { maxLength: VALIDATION_RULE_EXPRESSION_MAX_LENGTH },
    };
  }

  let parsedExpression: Expression;

  try {
    parsedExpression = parseValidationRuleExpression(expression);
  } catch (error) {
    return {
      isValid: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  if (hasValidationRuleBracketAccess(parsedExpression.tokens)) {
    return {
      isValid: false,
      errorMessage: 'Bracket access is not supported, use dot access instead',
      errorCode: 'BRACKET_ACCESS',
    };
  }

  const meaningfulTokens = tokenizeValidationRuleExpression(expression).filter(
    (token) => token.type !== 'whitespace',
  );
  const spacedMemberDotIndex = meaningfulTokens.findIndex(
    (token, index) =>
      token.type === 'symbol' &&
      token.text === '.' &&
      meaningfulTokens[index - 1]?.type === 'path' &&
      meaningfulTokens[index + 1]?.type === 'path',
  );

  if (spacedMemberDotIndex !== -1) {
    const path = `${meaningfulTokens[spacedMemberDotIndex - 1]?.text}.${meaningfulTokens[spacedMemberDotIndex + 1]?.text}`;

    return {
      isValid: false,
      errorMessage: `Write ${path} without spaces around the dot`,
      errorCode: 'SPACED_MEMBER_DOT',
      errorParams: { path },
    };
  }

  const identifierPaths = parsedExpression.variables({ withMembers: true });

  let bindings: ValidationRuleBindings = {};

  for (const path of identifierPaths) {
    const resolution = resolveValidationRuleIdentifierPath({ path, fields });

    if (!resolution.isResolved) {
      return {
        isValid: false,
        errorMessage: resolution.errorMessage,
        errorCode: resolution.errorCode,
        errorParams: resolution.errorParams,
      };
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
    return {
      isValid: false,
      errorMessage: emptyRecordEvaluation.errorMessage,
      errorCode: emptyRecordEvaluation.errorCode,
    };
  }

  return { isValid: true, bindings };
};
