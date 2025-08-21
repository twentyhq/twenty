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
} from 'twenty-shared/types';

import { parseAndEvaluateRelativeDateFilter } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/parse-and-evaluate-relative-date-filter.util';

type ResolvedFilter = Omit<StepFilter, 'value' | 'stepOutputKey'> & {
  rightOperand: unknown;
  leftOperand: unknown;
};

function evaluateFilter(filter: ResolvedFilter): boolean {
  switch (filter.type) {
    case 'NUMBER':
    case 'NUMERIC':
      return evaluateNumberFilter(filter);
    case 'DATE':
    case 'DATE_TIME':
      return evaluateDateFilter(filter);
    case 'TEXT':
    case 'MULTI_SELECT':
    case 'FULL_NAME':
    case 'EMAILS':
    case 'PHONES':
    case 'ADDRESS':
    case 'LINKS':
    case 'ARRAY':
    case 'RAW_JSON':
      return evaluateTextAndArrayFilter(filter);
    case 'SELECT':
      return evaluateSelectFilter(filter);
    case 'BOOLEAN':
      return evaluateBooleanFilter(filter);
    case 'UUID':
      return evaluateUuidFilter(filter);
    case 'RELATION':
      return evaluateRelationFilter(filter);
    case 'CURRENCY':
      return evaluateCurrencyFilter(filter);
    default:
      return evaluateDefaultFilter(filter);
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

function evaluateTextAndArrayFilter(filter: ResolvedFilter): boolean {
  switch (filter.operand) {
    case ViewFilterOperand.Contains:
      return contains(filter.leftOperand, filter.rightOperand);
    case ViewFilterOperand.DoesNotContain:
      return !contains(filter.leftOperand, filter.rightOperand);
    case ViewFilterOperand.IsEmpty:
      return !isNotEmptyTextOrArray(filter.leftOperand);

    case ViewFilterOperand.IsNotEmpty:
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
    case ViewFilterOperand.Is:
      return Boolean(filter.leftOperand) === Boolean(filter.rightOperand);
    default:
      throw new Error(
        `Operand ${filter.operand} not supported for boolean filter`,
      );
  }
}

function evaluateDateFilter(filter: ResolvedFilter): boolean {
  const dateLeftValue = new Date(String(filter.leftOperand));

  switch (filter.operand) {
    case ViewFilterOperand.Is:
      return (
        dateLeftValue.getDate() ===
        new Date(String(filter.rightOperand)).getDate()
      );
    case ViewFilterOperand.IsInPast:
      return dateLeftValue.getTime() < Date.now();

    case ViewFilterOperand.IsInFuture:
      return dateLeftValue.getTime() > Date.now();

    case ViewFilterOperand.IsToday:
      return dateLeftValue.toDateString() === new Date().toDateString();

    case ViewFilterOperand.IsBefore:
      return (
        dateLeftValue.getTime() <
        new Date(String(filter.rightOperand)).getTime()
      );

    case ViewFilterOperand.IsAfter:
      return (
        dateLeftValue.getTime() >
        new Date(String(filter.rightOperand)).getTime()
      );

    case ViewFilterOperand.IsEmpty:
      return (
        filter.leftOperand === null ||
        filter.leftOperand === undefined ||
        filter.leftOperand === ''
      );

    case ViewFilterOperand.IsNotEmpty:
      return (
        filter.leftOperand !== null &&
        filter.leftOperand !== undefined &&
        filter.leftOperand !== ''
      );

    case ViewFilterOperand.IsRelative:
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
    case ViewFilterOperand.Is:
      return filter.leftOperand === filter.rightOperand;
    case ViewFilterOperand.IsNot:
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
    case ViewFilterOperand.Is:
      return leftValue === rightValue;
    case ViewFilterOperand.IsNot:
      return leftValue !== rightValue;
    default:
      throw new Error(
        `Operand ${filter.operand} not supported for relation filter`,
      );
  }
}

function evaluateCurrencyFilter(filter: ResolvedFilter): boolean {
  if (filter.compositeFieldSubFieldName === 'currencyCode') {
    switch (filter.operand) {
      case ViewFilterOperand.Is:
        return filter.leftOperand === filter.rightOperand;
      case ViewFilterOperand.IsNot:
        return filter.leftOperand !== filter.rightOperand;
      case ViewFilterOperand.IsEmpty:
        return !isNonEmptyString(filter.leftOperand);
      case ViewFilterOperand.IsNotEmpty:
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
    case ViewFilterOperand.GreaterThanOrEqual:
      return Number(leftValue) >= Number(rightValue);

    case ViewFilterOperand.LessThanOrEqual:
      return Number(leftValue) <= Number(rightValue);

    case ViewFilterOperand.IsEmpty:
      return !isNonEmptyString(leftValue);

    case ViewFilterOperand.IsNotEmpty:
      return isNonEmptyString(leftValue);

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
    case ViewFilterOperand.Is:
      return leftValue == rightValue;
    case ViewFilterOperand.IsNot:
      return leftValue != rightValue;
    case ViewFilterOperand.IsEmpty:
      return !isNotEmptyTextOrArray(leftValue);
    case ViewFilterOperand.IsNotEmpty:
      return isNotEmptyTextOrArray(leftValue);
    case ViewFilterOperand.Contains:
      return contains(leftValue, rightValue);
    case ViewFilterOperand.DoesNotContain:
      return !contains(leftValue, rightValue);
    case ViewFilterOperand.GreaterThanOrEqual:
      return Number(leftValue) >= Number(rightValue);
    case ViewFilterOperand.LessThanOrEqual:
      return Number(leftValue) <= Number(rightValue);
    default:
      throw new Error(
        `Operand ${filter.operand} not supported for ${filter.type} filter type`,
      );
  }
}

function evaluateSelectFilter(filter: ResolvedFilter): boolean {
  switch (filter.operand) {
    case ViewFilterOperand.Is:
      return contains(filter.leftOperand, filter.rightOperand);
    case ViewFilterOperand.IsNot:
      return !contains(filter.leftOperand, filter.rightOperand);
    case ViewFilterOperand.IsEmpty:
      return !isNotEmptyTextOrArray(filter.leftOperand);

    case ViewFilterOperand.IsNotEmpty:
      return isNotEmptyTextOrArray(filter.leftOperand);
    default:
      throw new Error(
        `Operand ${filter.operand} not supported for select filter`,
      );
  }
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
