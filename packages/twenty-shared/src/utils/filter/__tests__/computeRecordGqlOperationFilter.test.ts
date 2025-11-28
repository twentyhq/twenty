import { computeRecordGqlOperationFilter } from '../computeRecordGqlOperationFilter';
import type {
  RecordFilter,
  RecordFilterGroup,
} from '../turnRecordFilterGroupIntoGqlOperationFilter';

import { FieldMetadataType } from '@/types/FieldMetadataType';
import type { PartialFieldMetadataItem } from '@/types/PartialFieldMetadataItem';
import { RecordFilterGroupLogicalOperator } from '@/types/RecordFilterGroupLogicalOperator';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { resolveInput } from '@/utils/variable-resolver';

describe('computeRecordGqlOperationFilter', () => {
  it('should handle same property referenced twice in a filter group with AND operator', () => {
    const companyNameField: PartialFieldMetadataItem = {
      id: 'company-name-field',
      name: 'name',
      label: 'Name',
      type: FieldMetadataType.TEXT,
    };

    const recordFilters: RecordFilter[] = [
      {
        id: 'filter-1',
        fieldMetadataId: companyNameField.id,
        value: 'Google',
        type: 'TEXT',
        operand: ViewFilterOperand.CONTAINS,
        recordFilterGroupId: 'group-1',
      },
      {
        id: 'filter-2',
        fieldMetadataId: companyNameField.id,
        value: 'Amdocs',
        type: 'TEXT',
        operand: ViewFilterOperand.CONTAINS,
        recordFilterGroupId: 'group-1',
      },
    ];

    const recordFilterGroups: RecordFilterGroup[] = [
      {
        id: 'group-1',
        parentRecordFilterGroupId: null,
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
      },
    ];

    const filter = computeRecordGqlOperationFilter({
      fields: [companyNameField],
      recordFilters,
      recordFilterGroups,
      filterValueDependencies: {},
    });

    // Both filters should be present in the AND array
    expect(filter).toEqual({
      and: [
        { name: { ilike: '%Google%' } },
        { name: { ilike: '%Amdocs%' } },
      ],
    });
  });

  it('should match Is UUID', () => {
    const companyIdField: PartialFieldMetadataItem = {
      id: 'company-id-field',
      name: 'id',
      label: 'ID',
      type: FieldMetadataType.UUID,
    };

    const uuidValue = '4f83d5c0-7c7a-4f67-9f29-0a6aad1f4eb1';

    const recordFilters: RecordFilter[] = [
      {
        id: 'uuid-filter',
        fieldMetadataId: companyIdField.id,
        value: uuidValue,
        type: 'UUID',
        operand: ViewFilterOperand.IS,
      },
    ];

    const filter = computeRecordGqlOperationFilter({
      fields: [companyIdField],
      recordFilters,
      recordFilterGroups: [],
      filterValueDependencies: {},
    });

    expect(filter).toEqual({
      id: {
        in: [uuidValue],
      },
    });
  });

  it('should handle same property with resolved variables after resolveInput is applied', () => {
    const companyNameField: PartialFieldMetadataItem = {
      id: 'company-name-field',
      name: 'name',
      label: 'Name',
      type: FieldMetadataType.TEXT,
    };

    // Simulate the workflow input before resolveInput
    const inputBeforeResolve = {
      filter: {
        recordFilters: [
          {
            id: 'filter-1',
            fieldMetadataId: companyNameField.id,
            value: 'Google',
            type: 'TEXT',
            operand: ViewFilterOperand.CONTAINS,
            recordFilterGroupId: 'group-1',
          },
          {
            id: 'filter-2',
            fieldMetadataId: companyNameField.id,
            value: '{{result.name}}', // Variable that will be resolved
            type: 'TEXT',
            operand: ViewFilterOperand.CONTAINS,
            recordFilterGroupId: 'group-1',
          },
        ],
        recordFilterGroups: [
          {
            id: 'group-1',
            parentRecordFilterGroupId: null,
            logicalOperator: RecordFilterGroupLogicalOperator.AND,
          },
        ],
      },
    };

    const context = {
      result: {
        name: 'Amdocs',
      },
    };

    // Apply resolveInput like the workflow executor does
    const resolvedInput = resolveInput(inputBeforeResolve, context) as {
      filter: {
        recordFilters: RecordFilter[];
        recordFilterGroups: RecordFilterGroup[];
      };
    };

    // Now compute the filter
    const filter = computeRecordGqlOperationFilter({
      fields: [companyNameField],
      recordFilters: resolvedInput.filter.recordFilters,
      recordFilterGroups: resolvedInput.filter.recordFilterGroups,
      filterValueDependencies: {},
    });

    // Both filters should be present in the AND array
    expect(filter).toEqual({
      and: [
        { name: { ilike: '%Google%' } },
        { name: { ilike: '%Amdocs%' } },
      ],
    });
  });

  it('should skip filter when variable resolves to undefined', () => {
    const companyNameField: PartialFieldMetadataItem = {
      id: 'company-name-field',
      name: 'name',
      label: 'Name',
      type: FieldMetadataType.TEXT,
    };

    // Simulate the workflow input before resolveInput
    const inputBeforeResolve = {
      filter: {
        recordFilters: [
          {
            id: 'filter-1',
            fieldMetadataId: companyNameField.id,
            value: 'Google',
            type: 'TEXT',
            operand: ViewFilterOperand.CONTAINS,
            recordFilterGroupId: 'group-1',
          },
          {
            id: 'filter-2',
            fieldMetadataId: companyNameField.id,
            value: '{{nonExistentPath.name}}', // Variable that won't resolve
            type: 'TEXT',
            operand: ViewFilterOperand.CONTAINS,
            recordFilterGroupId: 'group-1',
          },
        ],
        recordFilterGroups: [
          {
            id: 'group-1',
            parentRecordFilterGroupId: null,
            logicalOperator: RecordFilterGroupLogicalOperator.AND,
          },
        ],
      },
    };

    const context = {
      result: {
        name: 'Amdocs',
      },
    };

    // Apply resolveInput like the workflow executor does
    const resolvedInput = resolveInput(inputBeforeResolve, context) as {
      filter: {
        recordFilters: RecordFilter[];
        recordFilterGroups: RecordFilterGroup[];
      };
    };

    // The second filter's value should be undefined after resolution
    expect(resolvedInput.filter.recordFilters[1].value).toBeUndefined();

    // Compute the filter - only the first filter should be applied
    // because the second filter's value is undefined
    const filter = computeRecordGqlOperationFilter({
      fields: [companyNameField],
      recordFilters: resolvedInput.filter.recordFilters,
      recordFilterGroups: resolvedInput.filter.recordFilterGroups,
      filterValueDependencies: {},
    });

    // Only the first filter should be present since the second one has undefined value
    expect(filter).toEqual({
      and: [{ name: { ilike: '%Google%' } }],
    });
  });

  it('should handle same property referenced twice as regular filters (no filter group)', () => {
    const companyNameField: PartialFieldMetadataItem = {
      id: 'company-name-field',
      name: 'name',
      label: 'Name',
      type: FieldMetadataType.TEXT,
    };

    // These filters don't have recordFilterGroupId
    const recordFilters: RecordFilter[] = [
      {
        id: 'filter-1',
        fieldMetadataId: companyNameField.id,
        value: 'Google',
        type: 'TEXT',
        operand: ViewFilterOperand.CONTAINS,
      },
      {
        id: 'filter-2',
        fieldMetadataId: companyNameField.id,
        value: 'Amdocs',
        type: 'TEXT',
        operand: ViewFilterOperand.CONTAINS,
      },
    ];

    const filter = computeRecordGqlOperationFilter({
      fields: [companyNameField],
      recordFilters,
      recordFilterGroups: [],
      filterValueDependencies: {},
    });

    // Both filters should be present in the AND array
    expect(filter).toEqual({
      and: [
        { name: { ilike: '%Google%' } },
        { name: { ilike: '%Amdocs%' } },
      ],
    });
  });
});
