import { type Expression } from 'expr-eval-fork';

import { VALIDATION_RULE_EXPRESSION_MAX_LENGTH } from '@/constants/ValidationRuleExpressionMaxLength';
import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleCompilationResult } from '@/types/ValidationRuleCompilationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { type ValidationRuleAggregate } from '@/types/ValidationRuleAggregate';
import { buildValidationRuleEmptySetAggregateValues } from '@/utils/validation-rule/buildValidationRuleEmptySetAggregateValues';
import { collectValidationRuleAggregateCalls } from '@/utils/validation-rule/collectValidationRuleAggregateCalls';
import { evaluateValidationRuleExpression } from '@/utils/validation-rule/evaluateValidationRuleExpression';
import { hasValidationRuleBracketAccess } from '@/utils/validation-rule/hasValidationRuleBracketAccess';
import { isValidationRuleToManyRelationField } from '@/utils/validation-rule/isValidationRuleToManyRelationField';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';
import { resolveValidationRuleAggregateCall } from '@/utils/validation-rule/resolveValidationRuleAggregateCall';
import { resolveValidationRuleIdentifierPath } from '@/utils/validation-rule/resolveValidationRuleIdentifierPath';
import { validationRuleParser } from '@/utils/validation-rule/validationRuleParser';

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

  const { aggregateCalls, pathsOutsideAggregateCalls } =
    collectValidationRuleAggregateCalls(parsedExpression.tokens);

  const uncalledFunctionName = pathsOutsideAggregateCalls.find(
    (path) => path in validationRuleParser.functions,
  );

  if (uncalledFunctionName !== undefined) {
    return {
      isValid: false,
      errorMessage: `"${uncalledFunctionName}" is a function, call it like ${uncalledFunctionName}(...)`,
    };
  }

  const listPathOutsideAggregateCalls = pathsOutsideAggregateCalls.find(
    (path) =>
      isValidationRuleToManyRelationField(
        fields.find((field) => field.name === path.split('.')[0]),
      ),
  );

  if (listPathOutsideAggregateCalls !== undefined) {
    const [relationFieldName] = listPathOutsideAggregateCalls.split('.');

    return {
      isValid: false,
      errorMessage: `"${relationFieldName}" holds several records, use it in an aggregate like count(${relationFieldName})`,
    };
  }

  let bindings: ValidationRuleBindings = {};
  const aggregates: ValidationRuleAggregate[] = [];

  for (const aggregateCall of aggregateCalls) {
    const resolution = resolveValidationRuleAggregateCall({
      aggregateCall,
      fields,
    });

    if (!resolution.isResolved) {
      return { isValid: false, errorMessage: resolution.errorMessage };
    }

    aggregates.push(resolution.aggregate);
    bindings = { ...bindings, ...resolution.bindings };
  }

  const identifierPaths = parsedExpression
    .variables({ withMembers: true })
    .filter((path) => !(path in bindings));

  for (const path of identifierPaths) {
    const resolution = resolveValidationRuleIdentifierPath({ path, fields });

    if (!resolution.isResolved) {
      return { isValid: false, errorMessage: resolution.errorMessage };
    }

    bindings = { ...bindings, ...resolution.bindings };
  }

  const emptyRecordEvaluation = evaluateValidationRuleExpression({
    expression,
    record: buildValidationRuleEmptySetAggregateValues(aggregates),
    fields,
    now: new Date().toISOString(),
  });

  if (emptyRecordEvaluation.status === 'errored') {
    return { isValid: false, errorMessage: emptyRecordEvaluation.errorMessage };
  }

  return { isValid: true, bindings };
};
