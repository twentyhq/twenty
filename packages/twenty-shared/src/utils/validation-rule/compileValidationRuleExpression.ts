import { type Expression } from 'expr-eval-fork';

import { VALIDATION_RULE_EXPRESSION_MAX_LENGTH } from '@/constants/ValidationRuleExpressionMaxLength';
import { VALIDATION_RULE_FIELD_SYMBOL_PREFIX } from '@/constants/ValidationRuleFieldSymbolPrefix';
import { VALIDATION_RULE_NOW_VARIABLE_NAME } from '@/constants/ValidationRuleNowVariableName';
import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleCompilationResult } from '@/types/ValidationRuleCompilationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { type ValidationRuleResolvedIdentifierPath } from '@/types/ValidationRuleResolvedIdentifierPath';
import { hasValidationRuleBracketAccess } from '@/utils/validation-rule/hasValidationRuleBracketAccess';
import { evaluateValidationRuleExpression } from '@/utils/validation-rule/evaluateValidationRuleExpression';
import { mapValidationRuleExpressionPaths } from '@/utils/validation-rule/mapValidationRuleExpressionPaths';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';
import { resolveValidationRuleIdentifierPath } from '@/utils/validation-rule/resolveValidationRuleIdentifierPath';
import { tokenizeValidationRuleExpression } from '@/utils/validation-rule/tokenizeValidationRuleExpression';
import { isDefined } from '@/utils/validation/isDefined';

export const compileValidationRuleExpression = ({
  expression,
  fields,
  bindings = {},
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
  bindings?: ValidationRuleBindings;
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
    return {
      isValid: false,
      errorMessage: `Write ${meaningfulTokens[spacedMemberDotIndex - 1]?.text}.${meaningfulTokens[spacedMemberDotIndex + 1]?.text} without spaces around the dot`,
    };
  }

  const resolvedPathByPath = new Map<
    string,
    ValidationRuleResolvedIdentifierPath
  >();

  for (const path of parsedExpression.variables({ withMembers: true })) {
    const resolution = resolveValidationRuleIdentifierPath({
      path,
      fields,
      bindings,
      acceptsFieldNames: true,
    });

    if (!resolution.isResolved) {
      return { isValid: false, errorMessage: resolution.errorMessage };
    }

    resolvedPathByPath.set(path, resolution.resolvedPath);
  }

  const symbolByUniversalIdentifier = new Map<string, string>();

  const getFieldSymbol = (field: ValidationRuleFieldDescriptor): string => {
    const existingSymbol = symbolByUniversalIdentifier.get(
      field.universalIdentifier,
    );

    if (isDefined(existingSymbol)) {
      return existingSymbol;
    }

    const symbol = `${VALIDATION_RULE_FIELD_SYMBOL_PREFIX}${symbolByUniversalIdentifier.size + 1}`;

    symbolByUniversalIdentifier.set(field.universalIdentifier, symbol);

    return symbol;
  };

  const canonicalPaths = new Set([VALIDATION_RULE_NOW_VARIABLE_NAME]);

  const canonicalExpression = mapValidationRuleExpressionPaths({
    expression,
    mapPath: (path) => {
      const resolvedPath = resolvedPathByPath.get(path);

      if (!isDefined(resolvedPath) || resolvedPath.type === 'now') {
        return path;
      }

      const canonicalPath = [
        getFieldSymbol(resolvedPath.rootField),
        isDefined(resolvedPath.targetField)
          ? getFieldSymbol(resolvedPath.targetField)
          : null,
        resolvedPath.subfieldName,
      ]
        .filter(isDefined)
        .join('.');

      canonicalPaths.add(canonicalPath);

      return canonicalPath;
    },
  });

  const isEveryPathCanonical = parseValidationRuleExpression(
    canonicalExpression,
  )
    .variables({ withMembers: true })
    .every((path) => canonicalPaths.has(path));

  if (!isEveryPathCanonical) {
    return {
      isValid: false,
      errorMessage:
        'Write each field path in one piece, without parentheses or spaces',
    };
  }

  const canonicalBindings: ValidationRuleBindings = Object.fromEntries(
    [...symbolByUniversalIdentifier].map(([universalIdentifier, symbol]) => [
      symbol,
      universalIdentifier,
    ]),
  );

  const emptyRecordEvaluation = evaluateValidationRuleExpression({
    expression: canonicalExpression,
    bindings: canonicalBindings,
    record: {},
    fields,
    now: new Date().toISOString(),
  });

  if (emptyRecordEvaluation.status === 'errored') {
    return { isValid: false, errorMessage: emptyRecordEvaluation.errorMessage };
  }

  return {
    isValid: true,
    expression: canonicalExpression,
    bindings: canonicalBindings,
  };
};
