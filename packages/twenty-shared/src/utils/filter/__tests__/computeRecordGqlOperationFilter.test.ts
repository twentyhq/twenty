import { computeRecordGqlOperationFilter } from '../computeRecordGqlOperationFilter';
import type { RecordFilter } from '../turnRecordFilterGroupIntoGqlOperationFilter';

import { FieldMetadataType } from '@/types/FieldMetadataType';
import type { PartialFieldMetadataItem } from '@/types/PartialFieldMetadataItem';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';

describe('computeRecordGqlOperationFilter', () => {
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
      filterValueDependencies: {
        timeZone: 'UTC',
      },
    });

    expect(filter).toEqual({
      id: {
        in: [uuidValue],
      },
    });
  });
});
