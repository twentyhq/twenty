import { computeRecordGqlOperationFilter } from '../computeRecordGqlOperationFilter';
import type { RecordFilter } from '../turnRecordFilterGroupIntoGqlOperationFilter';

import type { PartialFieldMetadataItem } from '@/types/PartialFieldMetadataItem';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';

describe('computeRecordGqlOperationFilter', () => {
  describe('workflow find-records filters targeting a UUID field', () => {
    // Regression for workflow automation “Search Records” -> “ID is <UUID>” (issue #15746)
    it('injects the UUID entered in the filter into the gql filter when no recordIdsForUuid context is present', () => {
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
});

