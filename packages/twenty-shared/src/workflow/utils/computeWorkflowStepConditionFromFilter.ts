import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import {
  type StepFilterGroup,
  type StepFilterWithPotentiallyDeprecatedOperand,
} from '@/types/StepFilters';
import { compileValidationRuleExpression } from '@/utils/validation-rule/compileValidationRuleExpression';
import { convertWorkflowStepFiltersToRuleExpression } from '@/workflow/utils/convertWorkflowStepFiltersToRuleExpression';

// Undefined keeps the legacy filter: there are no rows, or they can't be expressed exactly
export const computeWorkflowStepConditionFromFilter = ({
  stepFilterGroups,
  stepFilters,
}: {
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilterWithPotentiallyDeprecatedOperand[];
}): string | undefined => {
  if (!isNonEmptyArray(stepFilters)) {
    return undefined;
  }

  const conversion = convertWorkflowStepFiltersToRuleExpression({
    stepFilterGroups,
    stepFilters,
  });

  if (!conversion.isConvertible) {
    return undefined;
  }

  return compileValidationRuleExpression({
    expression: conversion.expression,
    fields: [],
    allowsVariables: true,
  }).isValid
    ? conversion.expression
    : undefined;
};
