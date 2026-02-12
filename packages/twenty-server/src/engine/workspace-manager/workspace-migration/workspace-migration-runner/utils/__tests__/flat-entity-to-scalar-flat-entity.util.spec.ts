import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { flatEntityToScalarFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/flat-entity-to-scalar-flat-entity.util';

describe('flatEntityToScalarFlatEntity', () => {
  it('should return only scalar and structural properties, excluding universal extras', () => {
    const flatEntity = getFlatFieldMetadataMock({
      id: 'field-metadata-id',
      workspaceId: 'workspace-id',
      applicationId: 'application-id',
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

    const result = flatEntityToScalarFlatEntity({
      metadataName: 'fieldMetadata',
      flatEntity,
    });

    expect(result).toMatchInlineSnapshot(`
{
  "applicationId": "application-id",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "defaultValue": "'default-value'",
  "description": "test description",
  "icon": "IconTest",
  "id": "field-metadata-id",
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
  "objectMetadataId": "object-metadata-id",
  "options": null,
  "relationTargetFieldMetadataId": "relation-target-field-id",
  "relationTargetObjectMetadataId": "relation-target-object-id",
  "settings": null,
  "standardOverrides": null,
  "type": "TEXT",
  "universalIdentifier": "universal-identifier",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "workspaceId": "workspace-id",
}
`);
  });
});
