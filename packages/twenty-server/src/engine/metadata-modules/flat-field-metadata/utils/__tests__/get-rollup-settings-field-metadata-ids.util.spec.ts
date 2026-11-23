import { ViewFilterOperand } from 'twenty-shared/types';

import { getRollupSettingsFieldMetadataIds } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-rollup-settings-field-metadata-ids.util';

describe('getRollupSettingsFieldMetadataIds', () => {
  it('should list the relation, the aggregated field and the filter fields', () => {
    expect(
      getRollupSettingsFieldMetadataIds({
        relationFieldMetadataId: 'relation-id',
        aggregatedFieldMetadataId: 'amount-id',
        filters: [
          {
            id: 'filter-id',
            fieldMetadataId: 'stage-id',
            operand: ViewFilterOperand.IS,
            value: 'WON',
          },
        ],
      }),
    ).toEqual(['relation-id', 'amount-id', 'stage-id']);
  });

  it('should skip the aggregated field of a count', () => {
    expect(
      getRollupSettingsFieldMetadataIds({
        relationFieldMetadataId: 'relation-id',
        aggregatedFieldMetadataId: null,
        filters: [],
      }),
    ).toEqual(['relation-id']);
  });
});
