import {
  type StepFilterGroup,
  type StepFilterWithPotentiallyDeprecatedOperand,
} from '@/types/StepFilters';
import { type ValidationRuleDatabaseEventAction } from '@/types/ValidationRuleDatabaseEventAction';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { compileValidationRuleExpression } from '@/utils/validation-rule/compileValidationRuleExpression';
import { getValidationRulePreviousValueFieldPath } from '@/utils/validation-rule/getValidationRulePreviousValueFieldPath';
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

// Undefined keeps the legacy filter: the filter can't be expressed exactly, reads a field the object lacks,
// or reads a related record, which the filter reads with system permissions and a condition as the trigger owner
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
    !filter?.stepFilters?.length
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

  const readsRelatedRecordFields = Object.keys(compilation.bindings).some(
    (boundPath) => {
      const fieldPath =
        getValidationRulePreviousValueFieldPath(boundPath) ?? boundPath;

      return fieldPath.includes('.') && !fieldPath.endsWith('.id');
    },
  );

  return readsRelatedRecordFields ? undefined : conversion.expression;
};
