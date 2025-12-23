import {
  isNonEmptyArray,
  isNonEmptyString,
  isObject,
  isString,
} from '@sniptt/guards';
import {
  type StepFilter,
  type StepFilterGroup,
  ViewFilterOperand,
  type ViewFilterOperandDeprecated,
} from 'twenty-shared/types';
import {
  convertViewFilterOperandToCoreOperand as convertViewFilterOperandDeprecated,
  isDefined,
} from 'twenty-shared/utils';
import { parseBooleanFromStringValue } from 'twenty-shared/workflow';

import { findDefaultNullEquivalentValue } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/find-default-null-equivalent-value.util';
import { parseAndEvaluateRelativeDateFilter } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/parse-and-evaluate-relative-date-filter.util';

type ResolvedFilterWithPotentiallyDeprecatedOperand = Omit<
  StepFilter,
  'value' | 'stepOutputKey' | 'operand'
> & {
  rightOperand: unknown;
  leftOperand: unknown;
  operand: ViewFilterOperand | ViewFilterOperandDeprecated;
};

type ResolvedFilter = Omit<
  StepFilter,
  'value' | 'stepOutputKey' | 'operand'
> & {
  rightOperand: unknown;
  leftOperand: unknown;
  operand: ViewFilterOperand;
};

function evaluateFilter(
  filter: ResolvedFilterWithPotentiallyDeprecatedOperand,
): boolean {
  const filterWithConvertedOperand = {
    ...filter,
    operand: convertViewFilterOperandDeprecated(filter.operand),
  };

  switch (filter.type) {
    case 'NUMBER':
    case 'NUMERIC':
    case 'number':
      return evaluateNumberFilter(filterWithConvertedOperand);
    case 'DATE':
    case 'DATE_TIME':
      return evaluateDateFilter(filterWithConvertedOperand);
    case 'TEXT':
    case 'MULTI_SELECT':
    case 'FULL_NAME':
    case 'EMAILS':
    case 'PHONES':
    case 'ADDRESS':
    case 'LINKS':
    case 'ARRAY':
    case 'array':
    case 'RAW_JSON':
      return evaluateTextAndArrayFilter(
        filterWithConvertedOperand,
        filter.type,
        filter.compositeFieldSubFieldName,
      );
    case 'SELECT':
      return evaluateSelectFilter(filterWithConvertedOperand);
    case 'BOOLEAN':
    case 'boolean':
      return evaluateBooleanFilter(filterWithConvertedOperand);
    case 'UUID':
      return evaluateUuidFilter(filterWithConvertedOperand);
    case 'RELATION':
      return evaluateRelationFilter(filterWithConvertedOperand);
    case 'CURRENCY':
      return evaluateCurrencyFilter(filterWithConvertedOperand);
    case 'ACTOR':
      return evaluateActorFilter(filterWithConvertedOperand);
    default:
      return evaluateDefaultFilter(filterWithConvertedOperand);
  }
}

function evaluateFilterGroup(
  groupId: string,
  filterGroups: StepFilterGroup[],
  filters: ResolvedFilter[],
): boolean {
  const group = filterGroups.find((g) => g.id === groupId);

  if (!group) {
    throw new Error(`Filter group with id ${groupId} not found`);
  }

  const childGroups = filterGroups
    .filter((g) => g.parentStepFilterGroupId === groupId)
    .sort(
      (a, b) =>
        (a.positionInStepFilterGroup || 0) - (b.positionInStepFilterGroup || 0),
    );

  const groupFilters = filters.filter((f) => f.stepFilterGroupId === groupId);

  const filterResults = groupFilters.map((filter) => evaluateFilter(filter));

  const childGroupResults = childGroups.map((childGroup) =>
    evaluateFilterGroup(childGroup.id, filterGroups, filters),
  );

  const allResults = [...filterResults, ...childGroupResults];

  if (allResults.length === 0) {
    return true;
  }

  switch (group.logicalOperator) {
    case 'AND':
      return allResults.every((result) => result);

    case 'OR':
      return allResults.some((result) => result);

    default:
      throw new Error(`Unknown logical operator: ${group.logicalOperator}`);
  }
}

function contains(leftValue: unknown, rightValue: unknown): boolean {
  // if two arrays, check if any item is in the other array
  if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
    return leftValue.some((item) => rightValue.includes(item));
  }

  if (
    (Array.isArray(leftValue) || isString(leftValue)) &&
    isString(rightValue)
  ) {
    try {
      const parsedRightValue = JSON.parse(rightValue as string);

      if (Array.isArray(parsedRightValue)) {
        return parsedRightValue.some((item) => leftValue.includes(item));
      } else {
        return leftValue.includes(parsedRightValue);
      }
    } catch {
      return leftValue.includes(rightValue);
    }
  }

  return String(leftValue).includes(String(rightValue));
}

function evaluateTextAndArrayFilter(
  filter: ResolvedFilter,
  filterType: string,
  compositeFieldSubFieldName: string | undefined,
): boolean {
  //TODO : nullEquivalentRightValue to remove once feature flag removed + workflow action based on common api
  const nullEquivalentRightValue = findDefaultNullEquivalentValue({
    value: filter.rightOperand,
    fieldMetadataType: filterType,
    key: compositeFieldSubFieldName,
  });

  switch (filter.operand) {
    case ViewFilterOperand.CONTAINS:
      return (
        contains(filter.leftOperand, filter.rightOperand) ||
        (isDefined(nullEquivalentRightValue) &&
          !isNotEmptyTextOrArray(filter.leftOperand))
      );
    case ViewFilterOperand.DOES_NOT_CONTAIN:
      return (
        !contains(filter.leftOperand, filter.rightOperand) ||
        (isDefined(nullEquivalentRightValue) &&
          isNotEmptyTextOrArray(filter.leftOperand))
      );
    case ViewFilterOperand.IS_EMPTY:
      return !isNotEmptyTextOrArray(filter.leftOperand);

    case ViewFilterOperand.IS_NOT_EMPTY:
      return isNotEmptyTextOrArray(filter.leftOperand);

    default:
      throw new Error(
        `Operand ${filter.operand} not supported for this filter type`,
      );
  }
}

function isNotEmptyTextOrArray(value: unknown): boolean {
  return isNonEmptyString(value) || isNonEmptyArray(value);
}

function evaluateBooleanFilter(filter: ResolvedFilter): boolean {
  switch (filter.operand) {
    case ViewFilterOperand.IS:
      return (
        parseBooleanFromStringValue(filter.leftOperand) ===
        parseBooleanFromStringValue(filter.rightOperand)
      );
    default:
      throw new Error(
        `Operand ${filter.operand} not supported for boolean filter`,
      );
  }
}

function evaluateDateFilter(filter: ResolvedFilter): boolean {
  // TODO: refactor this with Temporal
  const dateLeftValue = new Date(String(filter.leftOperand));

  switch (filter.operand) {
    case ViewFilterOperand.IS:
      return (
        dateLeftValue.getDate() ===
        new Date(String(filter.rightOperand)).getDate()
      );
    case ViewFilterOperand.IS_IN_PAST:
      return dateLeftValue.getTime() < Date.now();

    case ViewFilterOperand.IS_IN_FUTURE:
      return dateLeftValue.getTime() > Date.now();

    case ViewFilterOperand.IS_TODAY:
      return dateLeftValue.toDateString() === new Date().toDateString();

    case ViewFilterOperand.IS_BEFORE:
      return (
        dateLeftValue.getTime() <
        new Date(String(filter.rightOperand)).getTime()
      );

    case ViewFilterOperand.IS_AFTER:
      return (
        dateLeftValue.getTime() >
        new Date(String(filter.rightOperand)).getTime()
      );

    case ViewFilterOperand.IS_EMPTY:
      return !isDefined(filter.leftOperand) || filter.leftOperand === '';

    case ViewFilterOperand.IS_NOT_EMPTY:
      return isDefined(filter.leftOperand) && filter.leftOperand !== '';

    case ViewFilterOperand.IS_RELATIVE:
      return parseAndEvaluateRelativeDateFilter({
        dateToCheck: dateLeftValue,
        relativeDateString: String(filter.rightOperand),
      });

    default:
      throw new Error(
        `Operand ${filter.operand} not supported for date filter`,
      );
  }
}

function evaluateUuidFilter(filter: ResolvedFilter): boolean {
  switch (filter.operand) {
    case ViewFilterOperand.IS:
      return filter.leftOperand === filter.rightOperand;
    case ViewFilterOperand.IS_NOT:
      return filter.leftOperand !== filter.rightOperand;
    default:
      throw new Error(
        `Operand ${filter.operand} not supported for uuid filter`,
      );
  }
}

function evaluateRelationFilter(filter: ResolvedFilter): boolean {
  // compare only the ids. If the left operand is the relation object, get the id
  const leftValue =
    isObject(filter.leftOperand) && 'id' in filter.leftOperand
      ? filter.leftOperand.id
      : filter.leftOperand;

  const rightValue =
    isObject(filter.rightOperand) && 'id' in filter.rightOperand
      ? filter.rightOperand.id
      : filter.rightOperand;

  switch (filter.operand) {
    case ViewFilterOperand.IS:
      return leftValue === rightValue;
    case ViewFilterOperand.IS_NOT:
      return leftValue !== rightValue;
    case ViewFilterOperand.IS_EMPTY:
      return !isNonEmptyString(leftValue);
    case ViewFilterOperand.IS_NOT_EMPTY:
      return isNonEmptyString(leftValue);
    default:
      throw new Error(
        `Operand ${filter.operand} not supported for relation filter`,
      );
  }
}

function evaluateCurrencyFilter(filter: ResolvedFilter): boolean {
  if (filter.compositeFieldSubFieldName === 'currencyCode') {
    switch (filter.operand) {
      case ViewFilterOperand.IS:
        return filter.leftOperand === filter.rightOperand;
      case ViewFilterOperand.IS_NOT:
        return filter.leftOperand !== filter.rightOperand;
      case ViewFilterOperand.IS_EMPTY:
        return !isNonEmptyString(filter.leftOperand);
      case ViewFilterOperand.IS_NOT_EMPTY:
        return isNonEmptyString(filter.leftOperand);
      default:
        throw new Error(
          `Operand ${filter.operand} not supported for currency filter`,
        );
    }
  } else {
    return evaluateNumberFilter(filter);
  }
}

function evaluateNumberFilter(filter: ResolvedFilter): boolean {
  const leftValue = filter.leftOperand;
  const rightValue = filter.rightOperand;

  switch (filter.operand) {
    case ViewFilterOperand.GREATER_THAN_OR_EQUAL:
      return Number(leftValue) >= Number(rightValue);

    case ViewFilterOperand.LESS_THAN_OR_EQUAL:
      return Number(leftValue) <= Number(rightValue);

    case ViewFilterOperand.IS_EMPTY:
      return !isDefined(filter.leftOperand) || filter.leftOperand === '';

    case ViewFilterOperand.IS_NOT_EMPTY:
      return isDefined(filter.leftOperand) && filter.leftOperand !== '';

    case ViewFilterOperand.IS:
      return Number(leftValue) === Number(rightValue);

    case ViewFilterOperand.IS_NOT:
      return Number(leftValue) !== Number(rightValue);

    default:
      throw new Error(
        `Operand ${filter.operand} not supported for number filter`,
      );
  }
}

function evaluateDefaultFilter(filter: ResolvedFilter): boolean {
  const leftValue = filter.leftOperand;
  const rightValue = filter.rightOperand;

  switch (filter.operand) {
    case ViewFilterOperand.IS:
      return leftValue == rightValue;
    case ViewFilterOperand.IS_NOT:
      return leftValue != rightValue;
    case ViewFilterOperand.IS_EMPTY:
      return !isNotEmptyTextOrArray(leftValue);
    case ViewFilterOperand.IS_NOT_EMPTY:
      return isNotEmptyTextOrArray(leftValue);
    case ViewFilterOperand.CONTAINS:
      return contains(leftValue, rightValue);
    case ViewFilterOperand.DOES_NOT_CONTAIN:
      return !contains(leftValue, rightValue);
    case ViewFilterOperand.GREATER_THAN_OR_EQUAL:
      return Number(leftValue) >= Number(rightValue);
    case ViewFilterOperand.LESS_THAN_OR_EQUAL:
      return Number(leftValue) <= Number(rightValue);
    default:
      throw new Error(
        `Operand ${filter.operand} not supported for ${filter.type} filter type`,
      );
  }
}

function evaluateSelectFilter(filter: ResolvedFilter): boolean {
  switch (filter.operand) {
    case ViewFilterOperand.IS:
      return contains(filter.leftOperand, filter.rightOperand);
    case ViewFilterOperand.IS_NOT:
      return !contains(filter.leftOperand, filter.rightOperand);
    case ViewFilterOperand.IS_EMPTY:
      return !isNotEmptyTextOrArray(filter.leftOperand);

    case ViewFilterOperand.IS_NOT_EMPTY:
      return isNotEmptyTextOrArray(filter.leftOperand);
    default:
      throw new Error(
        `Operand ${filter.operand} not supported for select filter`,
      );
  }
}

function evaluateActorFilter(filter: ResolvedFilter): boolean {
  const { compositeFieldSubFieldName } = filter;

  if (compositeFieldSubFieldName === 'source') {
    return evaluateSelectFilter(filter);
  }

  if (compositeFieldSubFieldName === 'workspaceMemberId') {
    return evaluateRelationFilter(filter);
  }

  return evaluateTextAndArrayFilter(filter, 'TEXT', compositeFieldSubFieldName);
}

export function evaluateFilterConditions({
  filterGroups = [],
  filters = [],
}: {
  filterGroups?: StepFilterGroup[];
  filters?: ResolvedFilter[];
}): boolean {
  if (filterGroups.length === 0 && filters.length === 0) {
    return true;
  }

  if (filterGroups.length > 0) {
    const groupIds = new Set(filterGroups.map((g) => g.id));

    for (const filter of filters) {
      if (!groupIds.has(filter.stepFilterGroupId)) {
        throw new Error(
          `Filter group with id ${filter.stepFilterGroupId} not found`,
        );
      }
    }
  }

  const rootGroups = filterGroups.filter((g) => !g.parentStepFilterGroupId);

  if (rootGroups.length === 0 && filters.length > 0) {
    const filterResults = filters.map((filter) => evaluateFilter(filter));

    return filterResults.every((result) => result);
  }

  const rootResults = rootGroups.map((rootGroup) =>
    evaluateFilterGroup(rootGroup.id, filterGroups, filters),
  );

  return rootResults.every((result) => result);
}
