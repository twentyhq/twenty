import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type UniversalFlatFieldPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-permission.type';
import { validateFieldPermissionGrantsNoDisabledAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-field-permission-grants-no-disabled-action.util';

const FIELD_UNIVERSAL_IDENTIFIER = 'amount-universal-identifier';

const buildFieldPermission = (
  overrides: Partial<UniversalFlatFieldPermission>,
): UniversalFlatFieldPermission => ({
  universalIdentifier: 'field-permission-universal-identifier',
  applicationUniversalIdentifier: 'application-universal-identifier',
  roleUniversalIdentifier: 'role-universal-identifier',
  objectMetadataUniversalIdentifier: 'invoice-universal-identifier',
  fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  canReadFieldValue: null,
  canUpdateFieldValue: null,
  createdAt: '2026-10-28T00:00:00.000Z',
  updatedAt: '2026-10-28T00:00:00.000Z',
  ...overrides,
});

const OWNING_APPLICATION_UNIVERSAL_IDENTIFIER = 'stripe-universal-identifier';

const amount = getFlatFieldMetadataMock({
  type: FieldMetadataType.NUMBER,
  objectMetadataId: 'invoice-id',
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: OWNING_APPLICATION_UNIVERSAL_IDENTIFIER,
  disabledFieldPermissionActions: ['canUpdateFieldValue'],
});

const workspaceRole = {
  applicationUniversalIdentifier: 'workspace-custom-universal-identifier',
};

describe('validateFieldPermissionGrantsNoDisabledAction', () => {
  it('should reject granting an action the field disables', () => {
    expect(
      validateFieldPermissionGrantsNoDisabledAction({
        flatFieldPermission: buildFieldPermission({
          canUpdateFieldValue: true,
        }),
        flatFieldMetadata: amount,
        flatRole: workspaceRole,
      }),
    ).toEqual([expect.objectContaining({ value: 'canUpdateFieldValue' })]);
  });

  it('should let the owning application grant a disabled action to its own role', () => {
    expect(
      validateFieldPermissionGrantsNoDisabledAction({
        flatFieldPermission: buildFieldPermission({
          canUpdateFieldValue: true,
        }),
        flatFieldMetadata: amount,
        flatRole: {
          applicationUniversalIdentifier:
            OWNING_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      }),
    ).toEqual([]);
  });
});
