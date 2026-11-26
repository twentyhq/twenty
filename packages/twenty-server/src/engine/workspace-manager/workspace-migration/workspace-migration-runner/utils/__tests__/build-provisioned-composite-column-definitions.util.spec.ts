import { FieldMetadataType } from 'twenty-shared/types';

import { buildProvisionedCompositeColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/build-provisioned-composite-column-definitions.util';

describe('buildProvisionedCompositeColumnDefinitions', () => {
  it('should define the nullable files column of a rich text field', () => {
    expect(
      buildProvisionedCompositeColumnDefinitions({
        fieldType: FieldMetadataType.RICH_TEXT,
        fieldName: 'summary',
      }),
    ).toEqual([
      {
        name: 'summaryFiles',
        type: 'jsonb',
        isNullable: true,
        isArray: false,
        default: null,
        isPrimary: false,
      },
    ]);
  });

  it('should define no column for a type without provisioned properties', () => {
    expect(
      buildProvisionedCompositeColumnDefinitions({
        fieldType: FieldMetadataType.FULL_NAME,
        fieldName: 'name',
      }),
    ).toEqual([]);
  });
});
