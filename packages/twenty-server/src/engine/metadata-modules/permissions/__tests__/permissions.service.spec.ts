import { PermissionFlagType } from 'twenty-shared/constants';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

const ROLE_ID = 'role-id';

const buildService = () => {
  const flatRoleMaps = createEmptyFlatEntityMaps();

  flatRoleMaps.byUniversalIdentifier.role = {
    id: ROLE_ID,
    universalIdentifier: 'role',
    canUpdateAllSettings: true,
    canAccessAllTools: true,
  } as never;
  flatRoleMaps.universalIdentifierById[ROLE_ID] = 'role';

  return new PermissionsService(
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatRoleMaps,
        flatRolePermissionFlagMaps: createEmptyFlatEntityMaps(),
      }),
    } as never,
    {} as never,
  );
};

describe('PermissionsService.checkRolesPermissions', () => {
  const check = (rolePermissionConfig: RolePermissionConfig) =>
    buildService().checkRolesPermissions(
      rolePermissionConfig,
      'workspace-id',
      PermissionFlagType.SEND_EMAIL_TOOL,
    );

  it('grants a flag every role grants', async () => {
    await expect(
      check({ intersectionOf: { userWorkspaceRoleId: ROLE_ID } }),
    ).resolves.toBe(true);
  });

  it('denies a flag the scope does not grant, whatever the roles', async () => {
    await expect(
      check({
        intersectionOf: { userWorkspaceRoleId: ROLE_ID },
        scope: { objectsPermissions: {}, grantedPermissionFlags: [] },
      }),
    ).resolves.toBe(false);
  });

  it('grants a flag both the roles and the scope grant', async () => {
    await expect(
      check({
        intersectionOf: { userWorkspaceRoleId: ROLE_ID },
        scope: {
          objectsPermissions: {},
          grantedPermissionFlags: [PermissionFlagType.SEND_EMAIL_TOOL],
        },
      }),
    ).resolves.toBe(true);
  });

  it('denies a flag the scope grants but no role does', async () => {
    await expect(
      check({
        intersectionOf: {},
        scope: {
          objectsPermissions: {},
          grantedPermissionFlags: [PermissionFlagType.SEND_EMAIL_TOOL],
        },
      }),
    ).resolves.toBe(false);
  });
});
