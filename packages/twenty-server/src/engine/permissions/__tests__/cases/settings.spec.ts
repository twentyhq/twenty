import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  buildPrincipals,
  UNREAD_AUTH_CONTEXT,
} from 'src/engine/permissions/__tests__/framework/build-principals.util';
import {
  buildSettingPermissionsService,
  FLAG,
  type RoleSetting,
  ROLE_SETTINGS,
} from 'src/engine/permissions/__tests__/framework/build-setting-permissions-service.util';
import {
  buildReachablePrincipals,
  CUSTOM_APPLICATION,
  findHeldRoles,
  NO_LIMITING_PRINCIPAL,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  APPLICATION_ID,
  APPLICATION_ROLE_ID,
  DELETED_APPLICATION_ID,
  LIMITING_ROLE_ID,
  MAIN_ROLE_ID,
  ROLELESS_APPLICATION_ID,
  USER_WORKSPACE_ID,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

const EVERY_ROLE_WITH_ALL_SETTINGS: Record<string, RoleSetting> = {
  [MAIN_ROLE_ID]: 'all settings',
  [LIMITING_ROLE_ID]: 'all settings',
  [APPLICATION_ROLE_ID]: 'all settings',
};

const MEMBER_PRINCIPALS = buildPrincipals({
  mainPrincipal: workspaceMember({ role: 'all settings' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: CUSTOM_APPLICATION,
});

const isRoleGranting = (roleSetting: RoleSetting) =>
  roleSetting === 'all settings' || roleSetting === 'flag assigned';

describe('hasPermissionFlag', () => {
  it('requires every role the principals hold', async () => {
    const violations: string[] = [];

    for (const principals of buildReachablePrincipals({
      roles: ROLE_SETTINGS,
    })) {
      const { mainPrincipal, limitingPrincipal, applicationPrincipal } =
        principals;
      const isGranted = await buildSettingPermissionsService({
        settingByRoleId: {
          [MAIN_ROLE_ID]: mainPrincipal.role,
          ...(limitingPrincipal.type === 'agent' && {
            [LIMITING_ROLE_ID]: limitingPrincipal.role,
          }),
          ...(applicationPrincipal.type === 'application' && {
            [APPLICATION_ROLE_ID]: applicationPrincipal.role,
          }),
        },
        principals: buildPrincipals(principals),
      }).hasPermissionFlag({
        authContext: UNREAD_AUTH_CONTEXT,
        permissionFlag: FLAG,
      });

      if (isGranted !== findHeldRoles(principals).every(isRoleGranting)) {
        violations.push(JSON.stringify(principals));
      }
    }

    expect(violations).toEqual([]);
  });

  it.each<{
    it: string;
    authContext: WorkspaceAuthContext | undefined;
    principals?: object;
    isGranted: boolean;
  }>([
    { it: 'no auth context', authContext: undefined, isGranted: false },
    {
      it: 'a system context',
      authContext: {
        type: 'system',
        workspace: { id: WORKSPACE_ID },
      } as WorkspaceAuthContext,
      isGranted: true,
    },
    {
      it: 'an auth context holding no role',
      authContext: UNREAD_AUTH_CONTEXT,
      isGranted: false,
    },
    {
      it: 'an AI run scope granting the flag',
      authContext: UNREAD_AUTH_CONTEXT,
      principals: {
        ...MEMBER_PRINCIPALS,
        aiRunScope: { permissionFlags: { [FLAG]: true } },
      },
      isGranted: true,
    },
    {
      it: 'an AI run scope refusing the flag',
      authContext: UNREAD_AUTH_CONTEXT,
      principals: {
        ...MEMBER_PRINCIPALS,
        aiRunScope: { permissionFlags: { [FLAG]: false } },
      },
      isGranted: false,
    },
    {
      it: 'an AI run scope silent about the flag',
      authContext: UNREAD_AUTH_CONTEXT,
      principals: {
        ...MEMBER_PRINCIPALS,
        aiRunScope: { permissionFlags: {} },
      },
      isGranted: false,
    },
  ])('$it', async ({ authContext, principals, isGranted }) => {
    expect(
      await buildSettingPermissionsService({
        settingByRoleId: EVERY_ROLE_WITH_ALL_SETTINGS,
        principals: principals as
          | PermissionsPrincipalsWithRolesContext
          | undefined,
      }).hasPermissionFlag({ authContext, permissionFlag: FLAG }),
    ).toBe(isGranted);
  });
});

describe('userWorkspaceHasPermissionFlag', () => {
  it.each(ROLE_SETTINGS)('%s', async (roleSetting) => {
    expect(
      await buildSettingPermissionsService({
        settingByRoleId: { [MAIN_ROLE_ID]: roleSetting },
      }).userWorkspaceHasPermissionFlag({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        permissionFlag: FLAG,
      }),
    ).toBe(isRoleGranting(roleSetting));
  });

  it('denies a user workspace with no role', async () => {
    expect(
      await buildSettingPermissionsService({
        settingByRoleId: EVERY_ROLE_WITH_ALL_SETTINGS,
      }).userWorkspaceHasPermissionFlag({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: 'unknown-user-workspace-id',
        permissionFlag: FLAG,
      }),
    ).toBe(false);
  });
});

describe('applicationHasPermissionFlag', () => {
  it.each(ROLE_SETTINGS)('default role with %s', async (roleSetting) => {
    expect(
      await buildSettingPermissionsService({
        settingByRoleId: { [APPLICATION_ROLE_ID]: roleSetting },
      }).applicationHasPermissionFlag({
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION_ID,
        permissionFlag: FLAG,
      }),
    ).toBe(isRoleGranting(roleSetting));
  });

  it.each([
    ['deleted', DELETED_APPLICATION_ID],
    ['roleless', ROLELESS_APPLICATION_ID],
    ['unknown', 'unknown-application-id'],
  ])('denies a %s application', async (_name, applicationId) => {
    expect(
      await buildSettingPermissionsService({
        settingByRoleId: EVERY_ROLE_WITH_ALL_SETTINGS,
      }).applicationHasPermissionFlag({
        workspaceId: WORKSPACE_ID,
        applicationId,
        permissionFlag: FLAG,
      }),
    ).toBe(false);
  });
});
