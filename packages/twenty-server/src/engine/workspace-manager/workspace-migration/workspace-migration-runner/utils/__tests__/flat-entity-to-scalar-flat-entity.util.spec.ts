import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
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
      overrides: null,
      settings: null,
      universalSettings: null,
      isSystem: false,
      isUIEditable: true,
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
  "disabledFieldPermissionActions": null,
  "icon": "IconTest",
  "id": "field-metadata-id",
  "isActive": true,
  "isAuditLogged": true,
  "isLabelSyncedWithName": false,
  "isNullable": true,
  "isSearchable": false,
  "isSystem": false,
  "isSystemSideEffect": false,
  "isUIEditable": true,
  "isUnique": false,
  "label": "Test Label",
  "morphId": null,
  "name": "testField",
  "objectMetadataId": "object-metadata-id",
  "options": null,
  "overrides": null,
  "relationTargetFieldMetadataId": "relation-target-field-id",
  "relationTargetObjectMetadataId": "relation-target-object-id",
  "settings": null,
  "type": "TEXT",
  "universalIdentifier": "universal-identifier",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "workspaceId": "workspace-id",
}
`);
  });

  it('should preserve secret application variable value instead of masking it', () => {
    const encryptedValue = 'dGVzdC1lbmNyeXB0ZWQtdmFsdWUtd2l0aC1pdi1wcmVmaXg=';

    const flatEntity: FlatApplicationVariable = {
      id: 'app-var-id',
      workspaceId: 'workspace-id',
      applicationId: 'application-id',
      universalIdentifier: 'app-var-universal-id',
      applicationUniversalIdentifier: 'app-universal-id',
      key: 'API_SECRET',
      value: encryptedValue as EncryptedString,
      description: 'An API secret key',
      isSecret: true,
      label: 'API secret',
      type: FieldMetadataType.TEXT,
      defaultValue: null,
      options: null,
      isDeprecated: false,
      isRequired: false,
      scope: 'WORKSPACE',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const result = flatEntityToScalarFlatEntity({
      metadataName: 'applicationVariable',
      flatEntity,
    });

    expect(result.value).toBe(encryptedValue);
  });

  it('should preserve non-secret application variable value', () => {
    const plainValue = 'https://example.com';

    const flatEntity: FlatApplicationVariable = {
      id: 'app-var-id',
      workspaceId: 'workspace-id',
      applicationId: 'application-id',
      universalIdentifier: 'app-var-universal-id',
      applicationUniversalIdentifier: 'app-universal-id',
      key: 'PUBLIC_URL',
      value: plainValue as EncryptedString,
      description: 'A public URL',
      isSecret: false,
      label: 'Public URL',
      type: FieldMetadataType.TEXT,
      defaultValue: null,
      options: null,
      isDeprecated: false,
      isRequired: false,
      scope: 'WORKSPACE',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const result = flatEntityToScalarFlatEntity({
      metadataName: 'applicationVariable',
      flatEntity,
    });

    expect(result.value).toBe(plainValue);
  });
});
