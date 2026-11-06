import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  buildAuthContextOrThrow,
  USER_AUTH_CONTEXT,
} from 'src/engine/permissions/__tests__/framework/build-auth-context.util';
import {
  buildSettingPermissionsService,
  FLAG,
  type RoleSetting,
  ROLE_SETTINGS,
} from 'src/engine/permissions/__tests__/framework/build-setting-permissions-service.util';
import {
  buildReachablePrincipals,
  findHeldRoles,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  APPLICATION_ID,
  APPLICATION_ROLE_ID,
  DELETED_APPLICATION_ID,
  LIMITING_ROLE_ID,
  MAIN_ROLE_ID,
  OAUTH_APPLICATION_ID,
  ROLELESS_APPLICATION_ID,
  USER_WORKSPACE_ID,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';

const EVERY_ROLE_WITH_ALL_SETTINGS: Record<string, RoleSetting> = {
  [MAIN_ROLE_ID]: 'all settings',
  [LIMITING_ROLE_ID]: 'all settings',
  [APPLICATION_ROLE_ID]: 'all settings',
};

const isRoleGranting = (roleSetting: RoleSetting) =>
  roleSetting === 'all settings' || roleSetting === 'flag assigned';

describe('hasPermissionFlag', () => {
  const combinations = buildReachablePrincipals({ roles: ROLE_SETTINGS })
    .map((principals) => ({
      principals,
      authContext: buildAuthContextOrThrow({ principals }),
    }))
    .filter(({ authContext }) => isDefined(authContext));

  it('requires every role the principals hold', async () => {
    const violations: string[] = [];

    for (const { principals, authContext } of combinations) {
      const { mainPrincipal, limitingPrincipal, applicationPrincipal } =
        principals;
      const isGranted = await buildSettingPermissionsService({
        [MAIN_ROLE_ID]: mainPrincipal.role,
        ...(limitingPrincipal.type === 'agent' && {
          [LIMITING_ROLE_ID]: limitingPrincipal.role,
        }),
        ...(applicationPrincipal.type === 'application' && {
          [APPLICATION_ROLE_ID]: applicationPrincipal.role,
        }),
      }).hasPermissionFlag({ authContext, permissionFlag: FLAG });

      if (isGranted !== findHeldRoles(principals).every(isRoleGranting)) {
        violations.push(JSON.stringify(principals));
      }
    }

    expect(violations).toEqual([]);
  });

  it.each<{
    it: string;
    authContext: object | undefined;
    isGranted: boolean;
  }>([
    { it: 'no auth context', authContext: undefined, isGranted: false },
    {
      it: 'a system context',
      authContext: { type: 'system', workspace: { id: WORKSPACE_ID } },
      isGranted: true,
    },
    {
      it: 'a pending activation user',
      authContext: {
        type: 'pendingActivationUser',
        workspace: { id: WORKSPACE_ID },
        userWorkspaceId: USER_WORKSPACE_ID,
      },
      isGranted: false,
    },
    {
      it: 'an AI run scope granting the flag',
      authContext: {
        ...USER_AUTH_CONTEXT,
        aiRunScope: { permissionFlags: { [FLAG]: true } },
      },
      isGranted: true,
    },
    {
      it: 'an AI run scope refusing the flag',
      authContext: {
        ...USER_AUTH_CONTEXT,
        aiRunScope: { permissionFlags: { [FLAG]: false } },
      },
      isGranted: false,
    },
    {
      it: 'an AI run scope silent about the flag',
      authContext: {
        ...USER_AUTH_CONTEXT,
        aiRunScope: { permissionFlags: {} },
      },
      isGranted: false,
    },
    {
      it: 'a deleted application acting for a member',
      authContext: {
        ...USER_AUTH_CONTEXT,
        application: { id: DELETED_APPLICATION_ID },
      },
      isGranted: false,
    },
    {
      it: 'an application with no role acting for a member',
      authContext: {
        ...USER_AUTH_CONTEXT,
        application: { id: ROLELESS_APPLICATION_ID },
      },
      isGranted: false,
    },
    {
      it: 'an OAuth application acting for a member',
      authContext: {
        ...USER_AUTH_CONTEXT,
        application: { id: OAUTH_APPLICATION_ID },
      },
      isGranted: true,
    },
  ])('$it', async ({ authContext, isGranted }) => {
    expect(
      await buildSettingPermissionsService(
        EVERY_ROLE_WITH_ALL_SETTINGS,
      ).hasPermissionFlag({
        authContext: authContext as WorkspaceAuthContext | undefined,
        permissionFlag: FLAG,
      }),
    ).toBe(isGranted);
  });
});

describe('userWorkspaceHasPermissionFlag', () => {
  it.each(ROLE_SETTINGS)('%s', async (roleSetting) => {
    expect(
      await buildSettingPermissionsService({
        [MAIN_ROLE_ID]: roleSetting,
      }).userWorkspaceHasPermissionFlag({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        permissionFlag: FLAG,
      }),
    ).toBe(isRoleGranting(roleSetting));
  });

  it('denies a user workspace with no role', async () => {
    expect(
      await buildSettingPermissionsService(
        EVERY_ROLE_WITH_ALL_SETTINGS,
      ).userWorkspaceHasPermissionFlag({
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
        [APPLICATION_ROLE_ID]: roleSetting,
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
      await buildSettingPermissionsService(
        EVERY_ROLE_WITH_ALL_SETTINGS,
      ).applicationHasPermissionFlag({
        workspaceId: WORKSPACE_ID,
        applicationId,
        permissionFlag: FLAG,
      }),
    ).toBe(false);
  });
});
