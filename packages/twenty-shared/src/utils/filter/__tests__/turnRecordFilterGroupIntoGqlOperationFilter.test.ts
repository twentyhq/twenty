import {
  FieldMetadataType,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from '@/types';
import { type HydratedRecordFilter } from '@/utils/filter/HydratedRecordFilter';
import { turnRecordFilterGroupsIntoGqlOperationFilter } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';

describe('turnRecordFilterGroupsIntoGqlOperationFilter', () => {
  const nameField = {
    id: 'f1',
    name: 'name',
    type: FieldMetadataType.TEXT,
    label: 'Name',
  };

  const filterInGroup = (
    recordFilterGroupId: string,
  ): HydratedRecordFilter => ({
    field: nameField,
    value: 'test',
    type: 'TEXT',
    operand: ViewFilterOperand.CONTAINS,
    recordFilterGroupId,
  });

  it('should return undefined when group is not found', () => {
    const result = turnRecordFilterGroupsIntoGqlOperationFilter({
      filterValueDependencies: {},
      filters: [],
      recordFilterGroups: [],
      currentRecordFilterGroupId: 'nonexistent',
    });

    expect(result).toBeUndefined();
  });

  it('should return AND filter for AND logical operator', () => {
    const result = turnRecordFilterGroupsIntoGqlOperationFilter({
      filterValueDependencies: {},
      filters: [filterInGroup('group1')],
      recordFilterGroups: [
        {
          id: 'group1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
      ],
      currentRecordFilterGroupId: 'group1',
    });

    expect(result).toHaveProperty('and');
  });

  it('should return OR filter for OR logical operator', () => {
    const result = turnRecordFilterGroupsIntoGqlOperationFilter({
      filterValueDependencies: {},
      filters: [filterInGroup('group1')],
      recordFilterGroups: [
        {
          id: 'group1',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
        },
      ],
      currentRecordFilterGroupId: 'group1',
    });

    expect(result).toHaveProperty('or');
  });

  it('should handle nested groups', () => {
    const result = turnRecordFilterGroupsIntoGqlOperationFilter({
      filterValueDependencies: {},
      filters: [filterInGroup('subgroup1')],
      recordFilterGroups: [
        {
          id: 'group1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
        {
          id: 'subgroup1',
          parentRecordFilterGroupId: 'group1',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
        },
      ],
      currentRecordFilterGroupId: 'group1',
    });

    expect(result).toHaveProperty('and');
    const andFilters = (result as { and: unknown[] }).and;

    expect(andFilters.length).toBeGreaterThan(0);
  });
});
