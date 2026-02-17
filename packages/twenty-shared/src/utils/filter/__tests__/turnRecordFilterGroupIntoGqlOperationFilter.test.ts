import {
  FieldMetadataType,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from '@/types';
import { turnRecordFilterGroupsIntoGqlOperationFilter } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';

describe('turnRecordFilterGroupsIntoGqlOperationFilter', () => {
  const fields = [
    {
      id: 'f1',
      name: 'name',
      type: FieldMetadataType.TEXT,
      label: 'Name',
    },
    {
      id: 'f2',
      name: 'age',
      type: FieldMetadataType.NUMBER,
      label: 'Age',
    },
  ];

  it('should return undefined when group is not found', () => {
    const result = turnRecordFilterGroupsIntoGqlOperationFilter({
      filterValueDependencies: {},
      filters: [],
      fields,
      recordFilterGroups: [],
      currentRecordFilterGroupId: 'nonexistent',
    });

    expect(result).toBeUndefined();
  });

  it('should return AND filter for AND logical operator', () => {
    const result = turnRecordFilterGroupsIntoGqlOperationFilter({
      filterValueDependencies: {},
      filters: [
        {
          id: 'filter1',
          fieldMetadataId: 'f1',
          value: 'test',
          type: 'TEXT',
          operand: ViewFilterOperand.CONTAINS,
          recordFilterGroupId: 'group1',
        },
      ],
      fields,
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
      filters: [
        {
          id: 'filter1',
          fieldMetadataId: 'f1',
          value: 'test',
          type: 'TEXT',
          operand: ViewFilterOperand.CONTAINS,
          recordFilterGroupId: 'group1',
        },
      ],
      fields,
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
      filters: [
        {
          id: 'filter1',
          fieldMetadataId: 'f1',
          value: 'test',
          type: 'TEXT',
          operand: ViewFilterOperand.CONTAINS,
          recordFilterGroupId: 'subgroup1',
        },
      ],
      fields,
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
    const andFilters = (result as any).and;

    expect(andFilters.length).toBeGreaterThan(0);
  });
});
