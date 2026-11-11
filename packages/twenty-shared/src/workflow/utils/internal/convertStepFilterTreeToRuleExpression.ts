import { isNonEmptyString } from '@sniptt/guards';

import { VALIDATION_RULE_EXPRESSION_MAX_LENGTH } from '@/constants/ValidationRuleExpressionMaxLength';
import {
  type StepFilterGroup,
  type StepFilterWithPotentiallyDeprecatedOperand,
} from '@/types/StepFilters';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import { isDefined } from '@/utils/validation/isDefined';
import { type StepFiltersToRuleExpressionConversionResult } from '@/workflow/types/StepFiltersToRuleExpressionConversionResult';
import { convertStepFilterToRuleExpressionNode } from '@/workflow/utils/internal/convertStepFilterToRuleExpressionNode';
import { type RuleExpressionNode } from '@/workflow/utils/internal/RuleExpressionNode';
import { type RuleExpressionNodeConversion } from '@/workflow/utils/internal/RuleExpressionNodeConversion';
import { ruleExpressionNodeBuilder } from '@/workflow/utils/internal/ruleExpressionNodeBuilder';
import { type StepFilterOperandSource } from '@/workflow/utils/internal/StepFilterOperandSource';

type StepFilterGroupTreeError = { reason: string } | undefined;

const findStepFilterGroupTreeError = ({
  stepFilterGroups,
  stepFilters,
}: {
  stepFilterGroups: StepFilterGroup[];
  stepFilters: StepFilterWithPotentiallyDeprecatedOperand[];
}): StepFilterGroupTreeError => {
  const groupIds = new Set(stepFilterGroups.map((group) => group.id));

  if (groupIds.size !== stepFilterGroups.length) {
    return { reason: 'two filter groups share an id' };
  }

  const filterWithUnknownGroup = stepFilters.find(
    (stepFilter) => !groupIds.has(stepFilter.stepFilterGroupId),
  );

  if (isDefined(filterWithUnknownGroup)) {
    return {
      reason: `filter ${filterWithUnknownGroup.id} is in an unknown group`,
    };
  }

  const reachableGroupIds = new Set<string>();
  let frontierGroupIds = stepFilterGroups
    .filter((group) => !isNonEmptyString(group.parentStepFilterGroupId))
    .map((group) => group.id);

  while (frontierGroupIds.length > 0) {
    frontierGroupIds.forEach((groupId) => reachableGroupIds.add(groupId));
    frontierGroupIds = stepFilterGroups
      .filter(
        (group) =>
          isNonEmptyString(group.parentStepFilterGroupId) &&
          frontierGroupIds.includes(group.parentStepFilterGroupId) &&
          !reachableGroupIds.has(group.id),
      )
      .map((group) => group.id);
  }

  // The legacy evaluator never reaches these groups and skips their filters
  return reachableGroupIds.size === stepFilterGroups.length
    ? undefined
    : { reason: 'some filter groups are not under a root group' };
};

const combineConversions = (
  conversions: RuleExpressionNodeConversion[],
  combine: (...nodes: RuleExpressionNode[]) => RuleExpressionNode,
): RuleExpressionNodeConversion => {
  const nodes: RuleExpressionNode[] = [];

  for (const conversion of conversions) {
    if (!conversion.isConvertible) {
      return conversion;
    }

    nodes.push(conversion.node);
  }

  return { isConvertible: true, node: combine(...nodes) };
};

const convertStepFilters = ({
  stepFilters,
  operandSource,
}: {
  stepFilters: StepFilterWithPotentiallyDeprecatedOperand[];
  operandSource: StepFilterOperandSource;
}): RuleExpressionNodeConversion[] =>
  stepFilters.map((stepFilter) => {
    const conversion = convertStepFilterToRuleExpressionNode({
      stepFilter,
      operandSource,
    });

    return conversion.isConvertible
      ? conversion
      : {
          isConvertible: false,
          reason: `Filter ${stepFilter.id}: ${conversion.reason}`,
        };
  });

// Same order as the legacy evaluator: the group's filters, then its child groups by position
const convertStepFilterGroup = ({
  stepFilterGroup,
  stepFilterGroups,
  stepFilters,
  operandSource,
}: {
  stepFilterGroup: StepFilterGroup;
  stepFilterGroups: StepFilterGroup[];
  stepFilters: StepFilterWithPotentiallyDeprecatedOperand[];
  operandSource: StepFilterOperandSource;
}): RuleExpressionNodeConversion => {
  const childGroups = stepFilterGroups
    .filter((group) => group.parentStepFilterGroupId === stepFilterGroup.id)
    .sort(
      (firstGroup, secondGroup) =>
        (firstGroup.positionInStepFilterGroup || 0) -
        (secondGroup.positionInStepFilterGroup || 0),
    );

  const childConversions = [
    ...convertStepFilters({
      stepFilters: stepFilters.filter(
        (stepFilter) => stepFilter.stepFilterGroupId === stepFilterGroup.id,
      ),
      operandSource,
    }),
    ...childGroups.map((childGroup) =>
      convertStepFilterGroup({
        stepFilterGroup: childGroup,
        stepFilterGroups,
        stepFilters,
        operandSource,
      }),
    ),
  ];

  if (childConversions.length === 0) {
    return { isConvertible: true, node: ruleExpressionNodeBuilder.true };
  }

  switch (stepFilterGroup.logicalOperator) {
    case 'AND':
      return combineConversions(
        childConversions,
        ruleExpressionNodeBuilder.and,
      );
    case 'OR':
      return combineConversions(childConversions, ruleExpressionNodeBuilder.or);
    default:
      return {
        isConvertible: false,
        reason: `filter group ${stepFilterGroup.id} has an unknown logical operator`,
      };
  }
};

const convertStepFilterTree = ({
  stepFilterGroups,
  stepFilters,
  operandSource,
}: {
  stepFilterGroups: StepFilterGroup[];
  stepFilters: StepFilterWithPotentiallyDeprecatedOperand[];
  operandSource: StepFilterOperandSource;
}): RuleExpressionNodeConversion => {
  if (!isNonEmptyArray(stepFilters)) {
    return { isConvertible: true, node: ruleExpressionNodeBuilder.true };
  }

  if (!isNonEmptyArray(stepFilterGroups)) {
    return combineConversions(
      convertStepFilters({ stepFilters, operandSource }),
      ruleExpressionNodeBuilder.and,
    );
  }

  const treeError = findStepFilterGroupTreeError({
    stepFilterGroups,
    stepFilters,
  });

  if (isDefined(treeError)) {
    return { isConvertible: false, reason: treeError.reason };
  }

  return combineConversions(
    stepFilterGroups
      .filter((group) => !isNonEmptyString(group.parentStepFilterGroupId))
      .map((rootGroup) =>
        convertStepFilterGroup({
          stepFilterGroup: rootGroup,
          stepFilterGroups,
          stepFilters,
          operandSource,
        }),
      ),
    ruleExpressionNodeBuilder.and,
  );
};

export const convertStepFilterTreeToRuleExpression = (
  params: Parameters<typeof convertStepFilterTree>[0],
): StepFiltersToRuleExpressionConversionResult => {
  const conversion = convertStepFilterTree(params);

  if (!conversion.isConvertible) {
    return conversion;
  }

  if (conversion.node.source.length > VALIDATION_RULE_EXPRESSION_MAX_LENGTH) {
    return {
      isConvertible: false,
      reason: `the expression is longer than ${VALIDATION_RULE_EXPRESSION_MAX_LENGTH} characters`,
    };
  }

  return { isConvertible: true, expression: conversion.node.source };
};
