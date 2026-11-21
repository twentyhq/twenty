import { FieldMetadataType } from 'twenty-shared/types';

import { buildProvisionedAheadCompositeColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/build-provisioned-ahead-composite-column-definitions.util';

describe('buildProvisionedAheadCompositeColumnDefinitions', () => {
  it('should define the nullable fileIds column of a rich text field', () => {
    expect(
      buildProvisionedAheadCompositeColumnDefinitions({
        fieldType: FieldMetadataType.RICH_TEXT,
        fieldName: 'summary',
      }),
    ).toEqual([
      {
        name: 'summaryFileIds',
        type: 'jsonb',
        isNullable: true,
        isArray: false,
        default: null,
        isPrimary: false,
      },
    ]);
  });

  it('should define no column for a type with nothing provisioned ahead', () => {
    expect(
      buildProvisionedAheadCompositeColumnDefinitions({
        fieldType: FieldMetadataType.FULL_NAME,
        fieldName: 'name',
      }),
    ).toEqual([]);
  });
});
