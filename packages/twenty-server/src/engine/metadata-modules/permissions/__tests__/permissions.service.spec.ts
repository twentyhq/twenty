import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { ApiKeyExceptionCode } from 'src/engine/core-modules/api-key/exceptions/api-key.exception';
import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';

type RoleFixture = {
  id: string;
  canUpdateAllSettings?: boolean;
  canAccessAllTools?: boolean;
  permissionFlags?: PermissionFlagType[];
};

type ApplicationFixture = {
  id: string;
  defaultRoleId: string | null;
  deletedAt?: Date | null;
};

const buildCache = ({
  roles = [],
  userWorkspaceRoleMap = {},
  apiKeyRoleMap = {},
  applications = [],
}: {
  roles?: RoleFixture[];
  userWorkspaceRoleMap?: Record<string, string>;
  apiKeyRoleMap?: Record<string, string>;
  applications?: ApplicationFixture[];
}) => {
  const rolePermissionFlags = roles.flatMap((role) =>
    (role.permissionFlags ?? []).map((permissionFlag) => ({
      id: `${role.id}-${permissionFlag}`,
      permissionFlagUniversalIdentifier: SystemPermissionFlag[permissionFlag],
    })),
  );

  return {
    userWorkspaceRoleMap,
    apiKeyRoleMap,
    rolesPermissions: Object.fromEntries(
      roles.map((role) => [role.id, { [`object-of-${role.id}`]: {} }]),
    ),
    flatApplicationMaps: {
      byId: Object.fromEntries(
        applications.map((application) => [
          application.id,
          { deletedAt: null, ...application },
        ]),
      ),
      idByUniversalIdentifier: {},
    } as unknown as FlatApplicationCacheMaps,
    flatRoleMaps: {
      byUniversalIdentifier: Object.fromEntries(
        roles.map((role) => [
          role.id,
          {
            id: role.id,
            canUpdateAllSettings: role.canUpdateAllSettings ?? false,
            canAccessAllTools: role.canAccessAllTools ?? false,
            rolePermissionFlagIds: (role.permissionFlags ?? []).map(
              (permissionFlag) => `${role.id}-${permissionFlag}`,
            ),
          },
        ]),
      ),
      universalIdentifierById: Object.fromEntries(
        roles.map((role) => [role.id, role.id]),
      ),
    } as unknown as FlatRoleMaps,
    flatRolePermissionFlagMaps: {
      byUniversalIdentifier: Object.fromEntries(
        rolePermissionFlags.map((rolePermissionFlag) => [
          rolePermissionFlag.id,
          rolePermissionFlag,
        ]),
      ),
      universalIdentifierById: Object.fromEntries(
        rolePermissionFlags.map((rolePermissionFlag) => [
          rolePermissionFlag.id,
          rolePermissionFlag.id,
        ]),
      ),
    } as unknown as FlatRolePermissionFlagMaps,
  };
};

const buildPermissionsService = (cache: ReturnType<typeof buildCache>) =>
  new PermissionsService({
    getOrRecompute: jest.fn().mockResolvedValue(cache),
  } as unknown as WorkspaceCacheService);

describe('PermissionsService', () => {
  describe('userHasWorkspaceSettingPermission', () => {
    it('grants a settings flag to a user whose role can update all settings', async () => {
      const permissionsService = buildPermissionsService(
        buildCache({
          roles: [{ id: 'admin-role', canUpdateAllSettings: true }],
          userWorkspaceRoleMap: { 'user-workspace-id': 'admin-role' },
        }),
      );

      await expect(
        permissionsService.userHasWorkspaceSettingPermission({
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: 'user-workspace-id',
          setting: PermissionFlagType.DATA_MODEL,
          applicationId: undefined,
        }),
      ).resolves.toBe(true);
    });

    it('grants a settings flag assigned to the role of the user and denies others', async () => {
      const permissionsService = buildPermissionsService(
        buildCache({
          roles: [
            {
              id: 'member-role',
              permissionFlags: [PermissionFlagType.WORKFLOWS],
            },
          ],
          userWorkspaceRoleMap: { 'user-workspace-id': 'member-role' },
        }),
      );

      const hasSetting = (setting: PermissionFlagType) =>
        permissionsService.userHasWorkspaceSettingPermission({
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: 'user-workspace-id',
          setting,
          applicationId: undefined,
        });

      await expect(hasSetting(PermissionFlagType.WORKFLOWS)).resolves.toBe(
        true,
      );
      await expect(hasSetting(PermissionFlagType.DATA_MODEL)).resolves.toBe(
        false,
      );
    });

    it('uses canAccessAllTools for tool flags and canUpdateAllSettings for settings flags', async () => {
      const permissionsService = buildPermissionsService(
        buildCache({
          roles: [
            { id: 'tools-role', canAccessAllTools: true },
            { id: 'settings-role', canUpdateAllSettings: true },
          ],
          userWorkspaceRoleMap: {
            'tools-user-workspace-id': 'tools-role',
            'settings-user-workspace-id': 'settings-role',
          },
        }),
      );

      const hasSetting = (
        userWorkspaceId: string,
        setting: PermissionFlagType,
      ) =>
        permissionsService.userHasWorkspaceSettingPermission({
          workspaceId: WORKSPACE_ID,
          userWorkspaceId,
          setting,
          applicationId: undefined,
        });

      await expect(
        hasSetting('tools-user-workspace-id', PermissionFlagType.AI),
      ).resolves.toBe(true);
      await expect(
        hasSetting('tools-user-workspace-id', PermissionFlagType.WORKSPACE),
      ).resolves.toBe(false);
      await expect(
        hasSetting('settings-user-workspace-id', PermissionFlagType.AI),
      ).resolves.toBe(false);
      await expect(
        hasSetting('settings-user-workspace-id', PermissionFlagType.WORKSPACE),
      ).resolves.toBe(true);
    });

    it('rejects when the user has no role', async () => {
      const permissionsService = buildPermissionsService(
        buildCache({
          roles: [{ id: 'admin-role', canUpdateAllSettings: true }],
          userWorkspaceRoleMap: { 'other-user-workspace-id': 'admin-role' },
        }),
      );

      await expect(
        permissionsService.userHasWorkspaceSettingPermission({
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: 'user-workspace-id',
          setting: PermissionFlagType.WORKSPACE,
          applicationId: undefined,
        }),
      ).rejects.toMatchObject({
        code: PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
      });
    });

    it('rejects when the role of the user is missing from the cache', async () => {
      const permissionsService = buildPermissionsService(
        buildCache({
          roles: [],
          userWorkspaceRoleMap: { 'user-workspace-id': 'deleted-role' },
        }),
      );

      await expect(
        permissionsService.userHasWorkspaceSettingPermission({
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: 'user-workspace-id',
          setting: PermissionFlagType.WORKSPACE,
          applicationId: undefined,
        }),
      ).rejects.toMatchObject({
        code: PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
      });
    });

    describe('when a user acts through an application', () => {
      const cache = buildCache({
        roles: [
          { id: 'admin-role', canUpdateAllSettings: true },
          {
            id: 'application-role',
            permissionFlags: [PermissionFlagType.WORKFLOWS],
          },
        ],
        userWorkspaceRoleMap: { 'user-workspace-id': 'admin-role' },
        applications: [
          { id: 'application-id', defaultRoleId: 'application-role' },
          { id: 'roleless-application-id', defaultRoleId: null },
          {
            id: 'deleted-application-id',
            defaultRoleId: 'application-role',
            deletedAt: new Date(),
          },
          { id: 'dangling-application-id', defaultRoleId: 'deleted-role' },
        ],
      });

      const hasSetting = (applicationId: string, setting: PermissionFlagType) =>
        buildPermissionsService(cache).userHasWorkspaceSettingPermission({
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: 'user-workspace-id',
          setting,
          applicationId,
        });

      it('grants only flags granted by both the user role and the application role', async () => {
        await expect(
          hasSetting('application-id', PermissionFlagType.WORKFLOWS),
        ).resolves.toBe(true);
        await expect(
          hasSetting('application-id', PermissionFlagType.DATA_MODEL),
        ).resolves.toBe(false);
      });

      it('uses the user role alone when the application has no default role', async () => {
        await expect(
          hasSetting('roleless-application-id', PermissionFlagType.DATA_MODEL),
        ).resolves.toBe(true);
      });

      it('rejects when the application was deleted', async () => {
        await expect(
          hasSetting('deleted-application-id', PermissionFlagType.WORKFLOWS),
        ).rejects.toMatchObject({
          code: ApplicationExceptionCode.APPLICATION_NOT_FOUND,
        });
        await expect(
          hasSetting('unknown-application-id', PermissionFlagType.WORKFLOWS),
        ).rejects.toMatchObject({
          code: ApplicationExceptionCode.APPLICATION_NOT_FOUND,
        });
      });

      it('rejects when the application role is missing from the cache', async () => {
        await expect(
          hasSetting('dangling-application-id', PermissionFlagType.WORKFLOWS),
        ).rejects.toMatchObject({
          code: PermissionsExceptionCode.APPLICATION_ROLE_NOT_FOUND,
        });
      });
    });

    describe('with an API key', () => {
      const cache = buildCache({
        roles: [
          {
            id: 'api-key-role',
            permissionFlags: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
          },
        ],
        apiKeyRoleMap: {
          'api-key-id': 'api-key-role',
          'dangling-api-key-id': 'deleted-role',
        },
      });

      const hasSetting = (apiKeyId: string, setting: PermissionFlagType) =>
        buildPermissionsService(cache).userHasWorkspaceSettingPermission({
          workspaceId: WORKSPACE_ID,
          apiKeyId,
          setting,
          applicationId: undefined,
        });

      it('evaluates the role of the API key', async () => {
        await expect(
          hasSetting('api-key-id', PermissionFlagType.API_KEYS_AND_WEBHOOKS),
        ).resolves.toBe(true);
        await expect(
          hasSetting('api-key-id', PermissionFlagType.WORKSPACE),
        ).resolves.toBe(false);
      });

      it('rejects when the API key has no role', async () => {
        await expect(
          hasSetting('unknown-api-key-id', PermissionFlagType.WORKSPACE),
        ).rejects.toMatchObject({
          code: ApiKeyExceptionCode.API_KEY_NO_ROLE_ASSIGNED,
        });
      });

      it('rejects when the role of the API key is missing from the cache', async () => {
        await expect(
          hasSetting('dangling-api-key-id', PermissionFlagType.WORKSPACE),
        ).rejects.toMatchObject({
          code: PermissionsExceptionCode.API_KEY_ROLE_NOT_FOUND,
        });
      });
    });

    describe('with an application token', () => {
      const cache = buildCache({
        roles: [
          {
            id: 'application-role',
            permissionFlags: [PermissionFlagType.LAYOUTS],
          },
        ],
        applications: [
          { id: 'application-id', defaultRoleId: 'application-role' },
          { id: 'roleless-application-id', defaultRoleId: null },
          { id: 'dangling-application-id', defaultRoleId: 'deleted-role' },
        ],
      });

      const hasSetting = (applicationId: string, setting: PermissionFlagType) =>
        buildPermissionsService(cache).userHasWorkspaceSettingPermission({
          workspaceId: WORKSPACE_ID,
          setting,
          applicationId,
        });

      it('evaluates the default role of the application', async () => {
        await expect(
          hasSetting('application-id', PermissionFlagType.LAYOUTS),
        ).resolves.toBe(true);
        await expect(
          hasSetting('application-id', PermissionFlagType.WORKSPACE),
        ).resolves.toBe(false);
      });

      it('denies when the application has no default role', async () => {
        await expect(
          hasSetting('roleless-application-id', PermissionFlagType.LAYOUTS),
        ).resolves.toBe(false);
      });

      it('rejects when the application does not exist', async () => {
        await expect(
          hasSetting('unknown-application-id', PermissionFlagType.LAYOUTS),
        ).rejects.toMatchObject({
          code: PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
        });
      });

      it('rejects when the application role is missing from the cache', async () => {
        await expect(
          hasSetting('dangling-application-id', PermissionFlagType.LAYOUTS),
        ).rejects.toMatchObject({
          code: PermissionsExceptionCode.APPLICATION_ROLE_NOT_FOUND,
        });
      });
    });

    it('rejects without any authentication context', async () => {
      await expect(
        buildPermissionsService(
          buildCache({}),
        ).userHasWorkspaceSettingPermission({
          workspaceId: WORKSPACE_ID,
          setting: PermissionFlagType.WORKSPACE,
          applicationId: undefined,
        }),
      ).rejects.toMatchObject({
        code: PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
      });
    });
  });

  describe('getUserWorkspacePermissions', () => {
    it('returns every flag and the object permissions of the user role', async () => {
      const permissionsService = buildPermissionsService(
        buildCache({
          roles: [
            {
              id: 'member-role',
              canAccessAllTools: true,
              permissionFlags: [PermissionFlagType.WORKFLOWS],
            },
          ],
          userWorkspaceRoleMap: { 'user-workspace-id': 'member-role' },
        }),
      );

      const { permissionFlags, objectsPermissions } =
        await permissionsService.getUserWorkspacePermissions({
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: 'user-workspace-id',
        });

      expect(Object.keys(permissionFlags).sort()).toEqual(
        Object.values(PermissionFlagType).sort(),
      );
      expect(permissionFlags[PermissionFlagType.WORKFLOWS]).toBe(true);
      expect(permissionFlags[PermissionFlagType.AI]).toBe(true);
      expect(permissionFlags[PermissionFlagType.DATA_MODEL]).toBe(false);
      expect(objectsPermissions).toEqual({ 'object-of-member-role': {} });
    });

    it('rejects when the user has no role', async () => {
      await expect(
        buildPermissionsService(buildCache({})).getUserWorkspacePermissions({
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: 'user-workspace-id',
        }),
      ).rejects.toMatchObject({
        code: PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
      });
    });
  });

  describe('getDefaultUserWorkspacePermissions', () => {
    it('denies every flag', () => {
      const { permissionFlags } = buildPermissionsService(
        buildCache({}),
      ).getDefaultUserWorkspacePermissions();

      expect(Object.keys(permissionFlags).sort()).toEqual(
        Object.values(PermissionFlagType).sort(),
      );
      expect(Object.values(permissionFlags).every((value) => !value)).toBe(
        true,
      );
    });
  });

  describe('checkRolesPermissions', () => {
    const cache = buildCache({
      roles: [
        { id: 'tools-role', canAccessAllTools: true },
        {
          id: 'workflows-role',
          permissionFlags: [PermissionFlagType.WORKFLOWS],
        },
        { id: 'empty-role' },
      ],
    });

    const check = (
      rolePermissionConfig: Parameters<
        PermissionsService['checkRolesPermissions']
      >[0],
      permissionFlag: PermissionFlagType,
    ) =>
      buildPermissionsService(cache).checkRolesPermissions(
        rolePermissionConfig,
        WORKSPACE_ID,
        permissionFlag,
      );

    it('bypasses for the system config', async () => {
      await expect(
        check(
          { shouldBypassPermissionChecks: true },
          PermissionFlagType.WORKSPACE,
        ),
      ).resolves.toBe(true);
    });

    it('requires every role of an intersection to grant the flag', async () => {
      await expect(
        check(
          { intersectionOf: ['tools-role', 'workflows-role'] },
          PermissionFlagType.HTTP_REQUEST_TOOL,
        ),
      ).resolves.toBe(false);
      await expect(
        check({ intersectionOf: ['tools-role'] }, PermissionFlagType.AI),
      ).resolves.toBe(true);
    });

    it('requires one role of a union to grant the flag', async () => {
      await expect(
        check(
          { unionOf: ['empty-role', 'workflows-role'] },
          PermissionFlagType.WORKFLOWS,
        ),
      ).resolves.toBe(true);
    });

    it('denies when no role is given or a role is missing from the cache', async () => {
      await expect(
        check({ intersectionOf: [] }, PermissionFlagType.AI),
      ).resolves.toBe(false);
      await expect(
        check(
          { intersectionOf: ['tools-role', 'deleted-role'] },
          PermissionFlagType.AI,
        ),
      ).resolves.toBe(false);
    });
  });
});
