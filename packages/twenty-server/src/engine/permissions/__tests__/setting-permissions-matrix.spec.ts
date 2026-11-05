import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildMatrixServices } from 'src/engine/permissions/__tests__/record-access-matrix/build-matrix-services.util';
import {
  LIMITING_ROLE_ID,
  MAIN_ROLE_ID,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.model';
import {
  APPLICATION_ID,
  buildMatrixCacheValues,
  MATRIX_ACTORS,
  OAUTH_APPLICATION_ID,
  USER_AUTH_CONTEXT,
  USER_WORKSPACE_ID,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.world';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';

type RoleSetting =
  | 'all settings'
  | 'flag assigned'
  | 'no flag'
  | 'missing role';

const ROLE_SETTINGS: RoleSetting[] = [
  'all settings',
  'flag assigned',
  'no flag',
  'missing role',
];
const FLAG = PermissionFlagType.WORKSPACE;
const DELETED_APPLICATION_ID = 'deleted-application-id';
const ROLELESS_APPLICATION_ID = 'roleless-application-id';

const buildRole = ({
  id,
  roleSetting,
}: {
  id: string;
  roleSetting: RoleSetting;
}) => ({
  id,
  canUpdateAllSettings: roleSetting === 'all settings',
  rolePermissionFlagIds: roleSetting === 'flag assigned' ? [`flag-${id}`] : [],
});

const buildService = ({
  mainRoleSetting,
  limitingRoleSetting,
}: {
  mainRoleSetting: RoleSetting;
  limitingRoleSetting: RoleSetting;
}) => {
  const roles = [
    { id: MAIN_ROLE_ID, roleSetting: mainRoleSetting },
    { id: LIMITING_ROLE_ID, roleSetting: limitingRoleSetting },
  ].filter(({ roleSetting }) => roleSetting !== 'missing role');
  const cacheValues = buildMatrixCacheValues({
    mainRoleGrant: 'none',
    limitingRoleGrant: 'none',
    isSharingEnabled: false,
  });
  const services = buildMatrixServices({
    ...cacheValues,
    flatApplicationMaps: {
      ...cacheValues.flatApplicationMaps,
      byId: {
        ...cacheValues.flatApplicationMaps.byId,
        [DELETED_APPLICATION_ID]: {
          id: DELETED_APPLICATION_ID,
          defaultRoleId: MAIN_ROLE_ID,
          deletedAt: '2026-01-01T00:00:00.000Z',
        },
        [ROLELESS_APPLICATION_ID]: {
          id: ROLELESS_APPLICATION_ID,
          defaultRoleId: null,
          deletedAt: null,
        },
      },
    },
    flatRoleMaps: {
      byUniversalIdentifier: Object.fromEntries(
        roles.map(({ id, roleSetting }) => [
          id,
          buildRole({ id, roleSetting }),
        ]),
      ),
      universalIdentifierById: Object.fromEntries(
        roles.map(({ id }) => [id, id]),
      ),
    },
    flatRolePermissionFlagMaps: {
      byUniversalIdentifier: Object.fromEntries(
        [MAIN_ROLE_ID, LIMITING_ROLE_ID].map((roleId) => [
          `flag-${roleId}`,
          {
            id: `flag-${roleId}`,
            permissionFlagUniversalIdentifier: SystemPermissionFlag[FLAG],
          },
        ]),
      ),
      universalIdentifierById: Object.fromEntries(
        [MAIN_ROLE_ID, LIMITING_ROLE_ID].map((roleId) => [
          `flag-${roleId}`,
          `flag-${roleId}`,
        ]),
      ),
    },
  });

  return new SettingPermissionsService(
    services.workspaceCacheService,
    services.principalPermissionsService,
  );
};

const isRoleGranting = (roleSetting: RoleSetting) =>
  roleSetting === 'all settings' || roleSetting === 'flag assigned';

describe('setting permissions matrix', () => {
  describe('hasPermissionFlag', () => {
    const combinations = MATRIX_ACTORS.flatMap(({ actor, authContext }) =>
      ROLE_SETTINGS.flatMap((mainRoleSetting) =>
        ROLE_SETTINGS.map((limitingRoleSetting) => ({
          actor,
          authContext,
          mainRoleSetting,
          limitingRoleSetting,
        })),
      ),
    );

    it.each(
      combinations.map(
        (combination) =>
          [
            `${combination.actor.name} / main ${combination.mainRoleSetting} / limiting ${combination.limitingRoleSetting}`,
            combination,
          ] as const,
      ),
    )('%s', async (_name, combination) => {
      const { actor, authContext, mainRoleSetting, limitingRoleSetting } =
        combination;
      const isGrantedByRoles =
        isRoleGranting(mainRoleSetting) &&
        (!actor.hasLimitingRole || isRoleGranting(limitingRoleSetting));

      expect(
        await buildService({
          mainRoleSetting,
          limitingRoleSetting,
        }).hasPermissionFlag({ authContext, permissionFlag: FLAG }),
        // the AI run actor carries a scope with no flag, which denies on its own
      ).toBe(isGrantedByRoles && !actor.hasAiRunScope);
    });

    it.each<[string, WorkspaceAuthContext | undefined, boolean]>([
      ['no auth context', undefined, false],
      [
        'system',
        {
          type: 'system',
          workspace: { id: WORKSPACE_ID },
        } as WorkspaceAuthContext,
        true,
      ],
      [
        'pending activation user',
        {
          type: 'pendingActivationUser',
          workspace: { id: WORKSPACE_ID },
          userWorkspaceId: USER_WORKSPACE_ID,
        } as WorkspaceAuthContext,
        false,
      ],
      [
        'AI run scope granting the flag',
        {
          ...USER_AUTH_CONTEXT,
          aiRunScope: { permissionFlags: { [FLAG]: true } },
        } as unknown as WorkspaceAuthContext,
        true,
      ],
      [
        'AI run scope refusing the flag',
        {
          ...USER_AUTH_CONTEXT,
          aiRunScope: { permissionFlags: { [FLAG]: false } },
        } as unknown as WorkspaceAuthContext,
        false,
      ],
      [
        'deleted application acting for a member',
        {
          ...USER_AUTH_CONTEXT,
          application: { id: DELETED_APPLICATION_ID },
        } as unknown as WorkspaceAuthContext,
        false,
      ],
      [
        'application with no role acting for a member',
        {
          ...USER_AUTH_CONTEXT,
          application: { id: ROLELESS_APPLICATION_ID },
        } as unknown as WorkspaceAuthContext,
        false,
      ],
      [
        'OAuth application acting for a member',
        {
          ...USER_AUTH_CONTEXT,
          application: { id: OAUTH_APPLICATION_ID },
        } as unknown as WorkspaceAuthContext,
        true,
      ],
    ])('%s', async (_name, authContext, isGranted) => {
      expect(
        await buildService({
          mainRoleSetting: 'all settings',
          limitingRoleSetting: 'all settings',
        }).hasPermissionFlag({ authContext, permissionFlag: FLAG }),
      ).toBe(isGranted);
    });
  });

  describe('userWorkspaceHasPermissionFlag', () => {
    it.each(ROLE_SETTINGS)('%s', async (mainRoleSetting) => {
      expect(
        await buildService({
          mainRoleSetting,
          limitingRoleSetting: 'no flag',
        }).userWorkspaceHasPermissionFlag({
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: USER_WORKSPACE_ID,
          permissionFlag: FLAG,
        }),
      ).toBe(isRoleGranting(mainRoleSetting));
    });

    it('denies a user workspace with no role', async () => {
      expect(
        await buildService({
          mainRoleSetting: 'all settings',
          limitingRoleSetting: 'all settings',
        }).userWorkspaceHasPermissionFlag({
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: 'unknown-user-workspace-id',
          permissionFlag: FLAG,
        }),
      ).toBe(false);
    });
  });

  describe('applicationHasPermissionFlag', () => {
    it.each(ROLE_SETTINGS)(
      'default role with %s',
      async (limitingRoleSetting) => {
        expect(
          await buildService({
            mainRoleSetting: 'no flag',
            limitingRoleSetting,
          }).applicationHasPermissionFlag({
            workspaceId: WORKSPACE_ID,
            applicationId: APPLICATION_ID,
            permissionFlag: FLAG,
          }),
        ).toBe(isRoleGranting(limitingRoleSetting));
      },
    );

    it.each([
      ['deleted', DELETED_APPLICATION_ID],
      ['roleless', ROLELESS_APPLICATION_ID],
      ['unknown', 'unknown-application-id'],
    ])('denies a %s application', async (_name, applicationId) => {
      expect(
        await buildService({
          mainRoleSetting: 'all settings',
          limitingRoleSetting: 'all settings',
        }).applicationHasPermissionFlag({
          workspaceId: WORKSPACE_ID,
          applicationId,
          permissionFlag: FLAG,
        }),
      ).toBe(false);
    });
  });
});
