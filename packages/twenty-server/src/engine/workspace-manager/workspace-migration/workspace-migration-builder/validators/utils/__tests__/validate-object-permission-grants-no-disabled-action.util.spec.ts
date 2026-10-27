import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';
import { validateObjectPermissionGrantsNoDisabledAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-object-permission-grants-no-disabled-action.util';

const OBJECT_UNIVERSAL_IDENTIFIER = 'invoice-universal-identifier';

const buildObjectPermission = (
  overrides: Partial<UniversalFlatObjectPermission>,
): UniversalFlatObjectPermission => ({
  universalIdentifier: 'object-permission-universal-identifier',
  applicationUniversalIdentifier: 'application-universal-identifier',
  roleUniversalIdentifier: 'role-universal-identifier',
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  canReadObjectRecords: true,
  canUpdateObjectRecords: null,
  canSoftDeleteObjectRecords: null,
  canDestroyObjectRecords: null,
  createdAt: '2026-10-27T00:00:00.000Z',
  updatedAt: '2026-10-27T00:00:00.000Z',
  ...overrides,
});

const invoice = getFlatObjectMetadataMock({
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  disabledObjectPermissionActions: ['canDestroyObjectRecords'],
});

describe('validateObjectPermissionGrantsNoDisabledAction', () => {
  it('should reject granting an action the object disables', () => {
    expect(
      validateObjectPermissionGrantsNoDisabledAction({
        flatObjectPermission: buildObjectPermission({
          canDestroyObjectRecords: true,
        }),
        flatObjectMetadata: invoice,
      }),
    ).toEqual([expect.objectContaining({ value: 'canDestroyObjectRecords' })]);
  });

  it('should accept turning a disabled action off or leaving it unset', () => {
    for (const canDestroyObjectRecords of [false, null]) {
      expect(
        validateObjectPermissionGrantsNoDisabledAction({
          flatObjectPermission: buildObjectPermission({
            canDestroyObjectRecords,
          }),
          flatObjectMetadata: invoice,
        }),
      ).toEqual([]);
    }
  });
});
