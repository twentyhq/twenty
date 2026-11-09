import { getApplicationGrantRoleUniversalIdentifier } from 'twenty-shared/application';

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
  rowLevelPermissionPredicateGroupUniversalIdentifier: null,
  canReadFieldValue: null,
  canUpdateFieldValue: null,
  createdAt: '2026-10-28T00:00:00.000Z',
  updatedAt: '2026-10-28T00:00:00.000Z',
  ...overrides,
});

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '0c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f';

const OWNING_APPLICATION_UNIVERSAL_IDENTIFIER =
  '5f1d3a2b-7c4e-4d6f-8a9b-1c2d3e4f5a6b';

const amount = getFlatFieldMetadataMock({
  type: FieldMetadataType.NUMBER,
  objectMetadataId: 'invoice-id',
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: OWNING_APPLICATION_UNIVERSAL_IDENTIFIER,
  disabledFieldPermissionActions: ['canUpdateFieldValue'],
});

const OWNING_APPLICATION_DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  'stripe-default-role-universal-identifier';

const owningApplicationDefaultRole = {
  universalIdentifier: OWNING_APPLICATION_DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: OWNING_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const owningApplicationOtherRole = {
  universalIdentifier: 'stripe-other-role-universal-identifier',
  applicationUniversalIdentifier: OWNING_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const otherApplicationDefaultRole = {
  universalIdentifier: OWNING_APPLICATION_DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier:
    WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const OWNING_APPLICATION_GRANT_ROLE_UNIVERSAL_IDENTIFIER =
  getApplicationGrantRoleUniversalIdentifier({
    grantedApplicationUniversalIdentifier:
      OWNING_APPLICATION_UNIVERSAL_IDENTIFIER,
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

const nonCustomRoleTakingGrantIdentifier = {
  universalIdentifier: OWNING_APPLICATION_GRANT_ROLE_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: OWNING_APPLICATION_UNIVERSAL_IDENTIFIER,
};

describe('validateFieldPermissionGrantsNoDisabledAction', () => {
  it('should let the owning application grant a disabled action to its default role', () => {
    expect(
      validateFieldPermissionGrantsNoDisabledAction({
        flatFieldPermission: buildFieldPermission({
          canUpdateFieldValue: true,
        }),
        flatFieldMetadata: amount,
        flatRole: owningApplicationDefaultRole,
        applicationDefaultRoleUniversalIdentifier:
          OWNING_APPLICATION_DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
        workspaceCustomApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual([]);
  });

  it('should reject a disabled action granted to a role that is not the owning application default role', () => {
    for (const flatRole of [
      owningApplicationOtherRole,
      otherApplicationDefaultRole,
      nonCustomRoleTakingGrantIdentifier,
    ]) {
      expect(
        validateFieldPermissionGrantsNoDisabledAction({
          flatFieldPermission: buildFieldPermission({
            canUpdateFieldValue: true,
          }),
          flatFieldMetadata: amount,
          flatRole,
          applicationDefaultRoleUniversalIdentifier:
            OWNING_APPLICATION_DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
          workspaceCustomApplicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).toEqual([expect.objectContaining({ value: 'canUpdateFieldValue' })]);
    }
  });

  it.each([
    [
      'keep',
      'the owning application',
      OWNING_APPLICATION_UNIVERSAL_IDENTIFIER,
      [],
    ],
    [
      'not keep',
      'another application',
      '9e8d7c6b-5a4f-4e3d-8c2b-1a0f9e8d7c6b',
      [expect.objectContaining({ value: 'canUpdateFieldValue' })],
    ],
  ])(
    'should %s a disabled action in the grant of %s',
    (_, __, grantedApplicationUniversalIdentifier, expectedErrors) => {
      expect(
        validateFieldPermissionGrantsNoDisabledAction({
          flatFieldPermission: buildFieldPermission({
            canUpdateFieldValue: true,
          }),
          flatFieldMetadata: amount,
          flatRole: {
            universalIdentifier: getApplicationGrantRoleUniversalIdentifier({
              grantedApplicationUniversalIdentifier,
              workspaceCustomApplicationUniversalIdentifier:
                WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
            }),
            applicationUniversalIdentifier:
              WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          },
          applicationDefaultRoleUniversalIdentifier: undefined,
          workspaceCustomApplicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).toEqual(expectedErrors);
    },
  );
});
