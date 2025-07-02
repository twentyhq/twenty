import {
  Filter,
  FilterGroup,
} from 'src/modules/workflow/workflow-executor/workflow-actions/filter/types/workflow-filter-action-settings.type';

type ResolvedFilter = Omit<Filter, 'value' | 'stepOutputKey'> & {
  rightOperand: unknown;
  leftOperand: unknown;
};

function evaluateFilter(filter: ResolvedFilter): boolean {
  const leftValue = filter.leftOperand;
  const rightValue = filter.rightOperand;

  switch (filter.operand) {
    case 'eq':
      return leftValue == rightValue;

    case 'ne':
      return leftValue != rightValue;

    case 'gt':
      return Number(leftValue) > Number(rightValue);

    case 'gte':
      return Number(leftValue) >= Number(rightValue);

    case 'lt':
      return Number(leftValue) < Number(rightValue);

    case 'lte':
      return Number(leftValue) <= Number(rightValue);

    case 'like':
      return String(leftValue).includes(String(rightValue));

    case 'ilike':
      return String(leftValue)
        .toLowerCase()
        .includes(String(rightValue).toLowerCase());

    case 'in':
      try {
        const values = JSON.parse(String(rightValue));

        return Array.isArray(values) && values.includes(leftValue);
      } catch {
        const values = String(rightValue)
          .split(',')
          .map((v) => v.trim());

        return values.includes(String(leftValue));
      }

    case 'is':
      if (String(rightValue).toLowerCase() === 'null') {
        return leftValue === null || leftValue === undefined;
      }
      if (String(rightValue).toLowerCase() === 'not null') {
        return leftValue !== null && leftValue !== undefined;
      }

      return leftValue === rightValue;

    default:
      throw new Error(`Unknown operand: ${filter.operand}`);
  }
}

/**
 * Recursively evaluates a filter group and its children
 */
function evaluateFilterGroup(
  groupId: string,
  filterGroups: FilterGroup[],
  filters: ResolvedFilter[],
): boolean {
  const group = filterGroups.find((g) => g.id === groupId);

  if (!group) {
    throw new Error(`Filter group with id ${groupId} not found`);
  }

  // Get all direct child groups
  const childGroups = filterGroups
    .filter((g) => g.parentRecordFilterGroupId === groupId)
    .sort(
      (a, b) =>
        (a.positionInRecordFilterGroup || 0) -
        (b.positionInRecordFilterGroup || 0),
    );

  const groupFilters = filters.filter((f) => f.recordFilterGroupId === groupId);

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
  filterGroups?: FilterGroup[];
  filters?: ResolvedFilter[];
}): boolean {
  if (filterGroups.length === 0 && filters.length === 0) {
    return true;
  }

  if (filterGroups.length > 0) {
    const groupIds = new Set(filterGroups.map((g) => g.id));

    for (const filter of filters) {
      if (!groupIds.has(filter.recordFilterGroupId)) {
        throw new Error(
          `Filter group with id ${filter.recordFilterGroupId} not found`,
        );
      }
    }
  }

  const rootGroups = filterGroups.filter((g) => !g.parentRecordFilterGroupId);

  if (rootGroups.length === 0 && filters.length > 0) {
    const filterResults = filters.map((filter) => evaluateFilter(filter));

    return filterResults.every((result) => result);
  }

  const rootResults = rootGroups.map((rootGroup) =>
    evaluateFilterGroup(rootGroup.id, filterGroups, filters),
  );

  return rootResults.every((result) => result);
}
