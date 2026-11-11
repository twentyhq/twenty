import {
  type StepFilterGroup,
  type StepFilterWithPotentiallyDeprecatedOperand,
} from '@/types/StepFilters';
import { type ValidationRuleDatabaseEventAction } from '@/types/ValidationRuleDatabaseEventAction';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { compileValidationRuleExpression } from '@/utils/validation-rule/compileValidationRuleExpression';
import { getValidationRulePreviousValueFieldPath } from '@/utils/validation-rule/getValidationRulePreviousValueFieldPath';
import { isValidationRuleToOneRelationField } from '@/utils/validation-rule/isValidationRuleToOneRelationField';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import { convertStepFiltersToRuleExpression } from '@/workflow/utils/convertStepFiltersToRuleExpression';

const DATABASE_EVENT_ACTIONS: ValidationRuleDatabaseEventAction[] = [
  'created',
  'updated',
  'upserted',
  'deleted',
  'destroyed',
  'restored',
];

const isDatabaseEventAction = (
  action: string | undefined,
): action is ValidationRuleDatabaseEventAction =>
  DATABASE_EVENT_ACTIONS.some(
    (databaseEventAction) => databaseEventAction === action,
  );

// Undefined keeps the legacy filter: inexact, an unknown field, or a relation (the filter loads it with system permissions)
export const computeDatabaseEventTriggerConditionFromFilter = ({
  eventName,
  filter,
  fields,
}: {
  eventName: string;
  filter:
    | {
        stepFilterGroups?: StepFilterGroup[];
        stepFilters?: StepFilterWithPotentiallyDeprecatedOperand[];
      }
    | null
    | undefined;
  fields: ValidationRuleFieldDescriptor[];
}): string | undefined => {
  const databaseEventAction = eventName.split('.')[1];

  if (
    !isDatabaseEventAction(databaseEventAction) ||
    !isNonEmptyArray(filter?.stepFilters)
  ) {
    return undefined;
  }

  const conversion = convertStepFiltersToRuleExpression({
    stepFilterGroups: filter.stepFilterGroups,
    stepFilters: filter.stepFilters,
    databaseEventAction,
  });

  if (!conversion.isConvertible) {
    return undefined;
  }

  const compilation = compileValidationRuleExpression({
    expression: conversion.expression,
    fields,
  });

  if (!compilation.isValid) {
    return undefined;
  }

  const toOneRelationFieldNames = fields
    .filter(isValidationRuleToOneRelationField)
    .map(({ name }) => name);
  const readsRelation = Object.keys(compilation.bindings).some((boundPath) => {
    const fieldPath =
      getValidationRulePreviousValueFieldPath(boundPath) ?? boundPath;

    return toOneRelationFieldNames.some(
      (relationFieldName) =>
        fieldPath === relationFieldName ||
        fieldPath.startsWith(`${relationFieldName}.`),
    );
  });

  return readsRelation ? undefined : conversion.expression;
};
