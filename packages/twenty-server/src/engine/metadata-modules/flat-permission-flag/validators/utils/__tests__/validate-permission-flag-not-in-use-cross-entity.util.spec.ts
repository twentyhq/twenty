import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import { validatePermissionFlagNotInUseCrossEntity } from 'src/engine/metadata-modules/flat-permission-flag/validators/utils/validate-permission-flag-not-in-use-cross-entity.util';
import { PermissionFlagExceptionCode } from 'src/engine/metadata-modules/permission-flag/permission-flag.exception';

const FLAG_UNIVERSAL_IDENTIFIER = '00000000-0000-0000-0000-000000000001';

const buildRolePermissionFlag = (
  overrides: Partial<FlatRolePermissionFlag> = {},
): FlatRolePermissionFlag =>
  ({
    id: '00000000-0000-0000-0000-000000000101',
    universalIdentifier: '00000000-0000-0000-0000-000000000101',
    permissionFlagId: FLAG_UNIVERSAL_IDENTIFIER,
    permissionFlagUniversalIdentifier: FLAG_UNIVERSAL_IDENTIFIER,
    roleUniversalIdentifier: '00000000-0000-0000-0000-000000000201',
    workspaceId: 'workspace-id',
    applicationId: '00000000-0000-0000-0000-000000000aaa',
    applicationUniversalIdentifier: '00000000-0000-0000-0000-000000000aaa',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }) as unknown as FlatRolePermissionFlag;

const buildRolePermissionFlagMaps = (
  rolePermissionFlags: FlatRolePermissionFlag[] = [],
): FlatEntityMaps<FlatRolePermissionFlag> => {
  const maps =
    createEmptyFlatEntityMaps() as unknown as FlatEntityMaps<FlatRolePermissionFlag>;

  for (const rolePermissionFlag of rolePermissionFlags) {
    maps.byUniversalIdentifier[rolePermissionFlag.universalIdentifier] =
      rolePermissionFlag;
  }

  return maps;
};

const buildArgs = (args: {
  rolePermissionFlags: FlatRolePermissionFlag[];
  deletedFlagUniversalIdentifiers: string[];
}) =>
  ({
    optimisticUniversalFlatMaps: {
      flatRolePermissionFlagMaps: buildRolePermissionFlagMaps(
        args.rolePermissionFlags,
      ),
    },
    deletedPermissionFlagActions: args.deletedFlagUniversalIdentifiers.map(
      (universalIdentifier) => ({
        type: 'delete',
        metadataName: 'permissionFlag',
        universalIdentifier,
        flatEntity: { universalIdentifier, key: 'MANAGE_INVOICES' },
      }),
    ),
  }) as unknown as Parameters<
    typeof validatePermissionFlagNotInUseCrossEntity
  >[0];

describe('validatePermissionFlagNotInUseCrossEntity', () => {
  it('returns no error when no permission flag is being deleted', () => {
    const result = validatePermissionFlagNotInUseCrossEntity(
      buildArgs({
        rolePermissionFlags: [buildRolePermissionFlag()],
        deletedFlagUniversalIdentifiers: [],
      }),
    );

    expect(result.permissionFlag).toHaveLength(0);
  });

  it('rejects deleting a flag still referenced by a role in the target state', () => {
    const result = validatePermissionFlagNotInUseCrossEntity(
      buildArgs({
        rolePermissionFlags: [buildRolePermissionFlag()],
        deletedFlagUniversalIdentifiers: [FLAG_UNIVERSAL_IDENTIFIER],
      }),
    );

    expect(
      result.permissionFlag.flatMap((failure) =>
        failure.errors.map((error) => error.code),
      ),
    ).toEqual([PermissionFlagExceptionCode.PERMISSION_FLAG_IN_USE]);
  });

  it('allows deleting a flag whose assignments are deleted in the same migration', () => {
    const result = validatePermissionFlagNotInUseCrossEntity(
      buildArgs({
        rolePermissionFlags: [],
        deletedFlagUniversalIdentifiers: [FLAG_UNIVERSAL_IDENTIFIER],
      }),
    );

    expect(result.permissionFlag).toHaveLength(0);
  });
});
