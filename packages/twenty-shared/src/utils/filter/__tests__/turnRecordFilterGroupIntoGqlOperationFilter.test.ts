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

    expect(result).toEqual({
      and: [
        {
          name: {
            ilike: '%test%',
          },
        },
      ],
    });
  });

  it('should return OR filter for OR logical operator', () => {
    const result = turnRecordFilterGroupsIntoGqlOperationFilter({
      filterValueDependencies: {},
      filters: [
        {
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

    expect(result).toEqual({
      or: [
        {
          name: {
            ilike: '%test%',
          },
        },
      ],
    });
  });

  it('should return NOT filter for NOT logical operator', () => {
    const result = turnRecordFilterGroupsIntoGqlOperationFilter({
      filterValueDependencies: {},
      filters: [
        {
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
          logicalOperator: RecordFilterGroupLogicalOperator.NOT,
        },
      ],
      currentRecordFilterGroupId: 'group1',
    });

    expect(result).toEqual({
      not: {
        or: [
          {
            name: {
              ilike: '%test%',
            },
          },
        ],
      },
    });
  });

  it('should handle nested groups', () => {
    const result = turnRecordFilterGroupsIntoGqlOperationFilter({
      filterValueDependencies: {},
      filters: [
        {
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

    expect(result).toEqual({
      and: [
        {
          or: [
            {
              name: {
                ilike: '%test%',
              },
            },
          ],
        },
      ],
    });
  });
});
