import { computeRecordGqlOperationFilter } from '../computeRecordGqlOperationFilter';
import type {
  RecordFilter,
  RecordFilterGroup,
} from '../turnRecordFilterGroupIntoGqlOperationFilter';

import { FieldMetadataType } from '@/types/FieldMetadataType';
import type { PartialFieldMetadataItem } from '@/types/PartialFieldMetadataItem';
import { RecordFilterGroupLogicalOperator } from '@/types/RecordFilterGroupLogicalOperator';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';

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
});
