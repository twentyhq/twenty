import { FieldMetadataType } from 'twenty-shared/types';

import { flatEntityTranspilers } from 'src/engine/metadata-modules/flat-entity/transpiler/flat-entity-transpilers.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';

describe('flatEntityTranspilers.toUniversalFlatEntity', () => {
  it('should remap FK and JSONB properties to universal keys, keep atomic and date properties, and exclude workspace-specific structural properties', () => {
    const flatEntity = getFlatFieldMetadataMock({
      universalIdentifier: 'universal-identifier',
      applicationUniversalIdentifier: 'app-universal-id',
      objectMetadataId: 'object-metadata-id',
      objectMetadataUniversalIdentifier: 'object-universal-id',
      type: FieldMetadataType.TEXT,
      defaultValue: "'default-value'",
      description: 'test description',
      icon: 'IconTest',
      isActive: true,
      isLabelSyncedWithName: false,
      isUnique: false,
      label: 'Test Label',
      name: 'testField',
      options: null,
      standardOverrides: null,
      settings: null,
      universalSettings: null,
      isCustom: true,
      isSystem: false,
      isUIReadOnly: false,
      isNullable: true,
      relationTargetFieldMetadataId: 'relation-target-field-id',
      relationTargetFieldMetadataUniversalIdentifier:
        'relation-target-field-universal-id',
      relationTargetObjectMetadataId: 'relation-target-object-id',
      relationTargetObjectMetadataUniversalIdentifier:
        'relation-target-object-universal-id',
      morphId: null,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });

    const result = flatEntityTranspilers.toUniversalFlatEntity({
      metadataName: 'fieldMetadata',
      flatEntity,
    });

    expect(result).toMatchInlineSnapshot(`
{
  "applicationUniversalIdentifier": "app-universal-id",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "defaultValue": "'default-value'",
  "description": "test description",
  "icon": "IconTest",
  "isActive": true,
  "isCustom": true,
  "isLabelSyncedWithName": false,
  "isNullable": true,
  "isSystem": false,
  "isUIReadOnly": false,
  "isUnique": false,
  "label": "Test Label",
  "morphId": null,
  "name": "testField",
  "objectMetadataUniversalIdentifier": "object-universal-id",
  "options": null,
  "relationTargetFieldMetadataUniversalIdentifier": "relation-target-field-universal-id",
  "relationTargetObjectMetadataUniversalIdentifier": "relation-target-object-universal-id",
  "standardOverrides": null,
  "type": "TEXT",
  "universalIdentifier": "universal-identifier",
  "universalSettings": null,
  "updatedAt": "2025-01-01T00:00:00.000Z",
}
`);
  });
});
