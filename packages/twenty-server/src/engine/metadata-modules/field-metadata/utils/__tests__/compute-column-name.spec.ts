import { FieldMetadataType } from 'twenty-shared/types';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';

describe('computeCompositeColumnName', () => {
  it('should compute composite column name for rich text v2 field', () => {
    const fieldMetadata = {
      name: 'bodyV2',
      type: FieldMetadataType.RICH_TEXT_V2,
    };

    const property = {
      name: 'markdown',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    };

    expect(computeCompositeColumnName(fieldMetadata, property)).toEqual(
      'bodyV2Markdown',
    );
  });
});
