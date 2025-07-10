import {
  StepFilter,
  StepFilterGroup,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

type ResolvedFilter = Omit<StepFilter, 'value' | 'stepOutputKey'> & {
  rightOperand: unknown;
  leftOperand: unknown;
};

function evaluateFilter(filter: ResolvedFilter): boolean {
  const leftValue = filter.leftOperand;
  const rightValue = filter.rightOperand;

  switch (filter.operand) {
    case ViewFilterOperand.Is:
      if (String(rightValue).toLowerCase() === 'null') {
        return leftValue === null || leftValue === undefined;
      }
      if (String(rightValue).toLowerCase() === 'not null') {
        return leftValue !== null && leftValue !== undefined;
      }

      return leftValue == rightValue;

    case ViewFilterOperand.IsNot:
      return leftValue != rightValue;

    case ViewFilterOperand.GreaterThanOrEqual:
      return Number(leftValue) >= Number(rightValue);

    case ViewFilterOperand.LessThanOrEqual:
      return Number(leftValue) <= Number(rightValue);

    case ViewFilterOperand.Contains:
      if (Array.isArray(leftValue)) {
        return leftValue.includes(rightValue);
      }

      return String(leftValue).includes(String(rightValue));

    case ViewFilterOperand.DoesNotContain:
      if (Array.isArray(leftValue)) {
        return !leftValue.includes(rightValue);
      }

      return !String(leftValue).includes(String(rightValue));

    case ViewFilterOperand.IsEmpty:
      return (
        leftValue === null ||
        leftValue === undefined ||
        leftValue === '' ||
        (Array.isArray(leftValue) && leftValue.length === 0)
      );

    case ViewFilterOperand.IsNotEmpty:
      return (
        leftValue !== null &&
        leftValue !== undefined &&
        leftValue !== '' &&
        (!Array.isArray(leftValue) || leftValue.length > 0)
      );

    case ViewFilterOperand.IsNotNull:
      return leftValue !== null && leftValue !== undefined;

    case ViewFilterOperand.IsRelative:
    case ViewFilterOperand.IsInPast:
    case ViewFilterOperand.IsInFuture:
    case ViewFilterOperand.IsToday:
    case ViewFilterOperand.IsBefore:
    case ViewFilterOperand.IsAfter:
      // Date/time operands - for now, return false as placeholder
      // These would need proper date logic implementation
      return false;

    case ViewFilterOperand.VectorSearch:
      return false;

    default:
      assertUnreachable(filter.operand);
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
