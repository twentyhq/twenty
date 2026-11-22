import { FieldMetadataType } from 'twenty-shared/types';

import { buildServerOnlyCompositeColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/build-server-only-composite-column-definitions.util';

describe('buildServerOnlyCompositeColumnDefinitions', () => {
  it('should define the nullable fileIds column of a rich text field', () => {
    expect(
      buildServerOnlyCompositeColumnDefinitions({
        fieldType: FieldMetadataType.RICH_TEXT,
        fieldName: 'summary',
      }),
    ).toEqual([
      {
        name: 'summary_fileIds',
        type: 'jsonb',
        isNullable: true,
        isArray: false,
        default: null,
        isPrimary: false,
      },
    ]);
  });

  it('should define no column for a type without server-only columns', () => {
    expect(
      buildServerOnlyCompositeColumnDefinitions({
        fieldType: FieldMetadataType.FULL_NAME,
        fieldName: 'name',
      }),
    ).toEqual([]);
  });
});
