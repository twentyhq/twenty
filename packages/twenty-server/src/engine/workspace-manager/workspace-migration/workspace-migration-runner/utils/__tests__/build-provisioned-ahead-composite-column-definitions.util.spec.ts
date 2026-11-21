import { FieldMetadataType } from 'twenty-shared/types';

import { COMPOSITE_PROPERTIES_PROVISIONED_AHEAD_OF_RUNTIME } from 'src/engine/metadata-modules/field-metadata/constants/composite-properties-provisioned-ahead-of-runtime.constant';
import { buildProvisionedAheadCompositeColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/build-provisioned-ahead-composite-column-definitions.util';

describe('buildProvisionedAheadCompositeColumnDefinitions', () => {
  beforeEach(() => {
    COMPOSITE_PROPERTIES_PROVISIONED_AHEAD_OF_RUNTIME[
      FieldMetadataType.FULL_NAME
    ] = [
      {
        name: 'nickname',
        type: FieldMetadataType.TEXT,
        hidden: true,
        isRequired: false,
      },
    ];
  });

  afterEach(() => {
    delete COMPOSITE_PROPERTIES_PROVISIONED_AHEAD_OF_RUNTIME[
      FieldMetadataType.FULL_NAME
    ];
  });

  it('should define a nullable column for a property provisioned ahead', () => {
    expect(
      buildProvisionedAheadCompositeColumnDefinitions({
        fieldType: FieldMetadataType.FULL_NAME,
        fieldName: 'name',
      }),
    ).toEqual([
      {
        name: 'nameNickname',
        type: 'text',
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
        fieldType: FieldMetadataType.RICH_TEXT,
        fieldName: 'summary',
      }),
    ).toEqual([]);
  });
});
