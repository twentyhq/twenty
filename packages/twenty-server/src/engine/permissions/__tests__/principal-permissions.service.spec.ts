import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { getPermissionsPrincipalsShareKeys } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-share-keys.util';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const USER_ID = 'user-id';
const USER_WORKSPACE_ID = 'user-workspace-id';
const MEMBER_ID = 'workspace-member-id';
const API_KEY_ID = 'api-key-id';
const WEBHOOK_ID = 'webhook-id';
const MAIN_AGENT_ID = 'main-agent-id';
const LIMITING_AGENT_ID = 'limiting-agent-id';
const MAIN_APPLICATION_ID = 'main-application-id';
const APPLICATION_ID = 'application-id';
const OAUTH_APPLICATION_ID = 'oauth-application-id';
const ROLELESS_APPLICATION_ID = 'roleless-application-id';
const MAIN_ROLE_ID = 'main-role-id';
const LIMITING_ROLE_ID = 'limiting-role-id';
const APPLICATION_ROLE_ID = 'application-role-id';

const LOCAL_APPLICATION = {
  deletedAt: null,
  sourceType: ApplicationRegistrationSourceType.LOCAL,
};

const FLAT_APPLICATION_MAPS: {
  byId: Record<string, object>;
  idByUniversalIdentifier: Record<string, string>;
} = {
  byId: {
    [APPLICATION_ID]: {
      ...LOCAL_APPLICATION,
      id: APPLICATION_ID,
      defaultRoleId: APPLICATION_ROLE_ID,
    },
    [MAIN_APPLICATION_ID]: {
      ...LOCAL_APPLICATION,
      id: MAIN_APPLICATION_ID,
      defaultRoleId: MAIN_ROLE_ID,
    },
    [ROLELESS_APPLICATION_ID]: {
      ...LOCAL_APPLICATION,
      id: ROLELESS_APPLICATION_ID,
      defaultRoleId: null,
    },
    [OAUTH_APPLICATION_ID]: {
      id: OAUTH_APPLICATION_ID,
      defaultRoleId: null,
      deletedAt: null,
      sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
    },
  },
  idByUniversalIdentifier: {},
};

const CACHE_VALUES = {
  flatApplicationMaps: FLAT_APPLICATION_MAPS,
  userWorkspaceRoleMap: { [USER_WORKSPACE_ID]: MAIN_ROLE_ID },
  apiKeyRoleMap: { [API_KEY_ID]: MAIN_ROLE_ID },
  flatRoleTargetByAgentIdMaps: {
    [MAIN_AGENT_ID]: { roleId: MAIN_ROLE_ID },
    [LIMITING_AGENT_ID]: { roleId: LIMITING_ROLE_ID },
  },
  flatRoleTargetMaps: {
    byUniversalIdentifier: {
      'webhook-role-target': { webhookId: WEBHOOK_ID, roleId: MAIN_ROLE_ID },
    },
  },
  flatWorkspaceMemberMaps: {
    byId: { [MEMBER_ID]: { userId: USER_ID, deletedAt: null } },
    idByUserId: { [USER_ID]: MEMBER_ID },
    userWorkspaceIdByUserId: { [USER_ID]: USER_WORKSPACE_ID },
  },
};

const USER_AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
  userWorkspaceId: USER_WORKSPACE_ID,
  workspaceMemberId: MEMBER_ID,
  user: { id: USER_ID },
  workspaceMember: { id: MEMBER_ID },
  userSessionVariant: 'standard',
};
const API_KEY_AUTH_CONTEXT = {
  type: 'apiKey',
  workspace: { id: WORKSPACE_ID },
  apiKey: { id: API_KEY_ID },
};
const APPLICATION_AUTH_CONTEXT = {
  type: 'application',
  workspace: { id: WORKSPACE_ID },
  application: { id: MAIN_APPLICATION_ID },
};
const WEBHOOK_AUTH_CONTEXT = {
  type: 'webhook',
  workspace: { id: WORKSPACE_ID },
  webhook: { id: WEBHOOK_ID },
};

const MEMBER = {
  type: 'workspaceMember',
  workspaceMemberId: MEMBER_ID,
  roleId: MAIN_ROLE_ID,
};
const API_KEY = { type: 'apiKey', apiKeyId: API_KEY_ID, roleId: MAIN_ROLE_ID };
const LIMITING_AGENT = {
  type: 'agent',
  agentId: LIMITING_AGENT_ID,
  roleId: LIMITING_ROLE_ID,
};
const ACTING_APPLICATION = {
  type: 'application',
  applicationId: APPLICATION_ID,
  roleId: APPLICATION_ROLE_ID,
};
const MAIN_APPLICATION = {
  type: 'application',
  applicationId: MAIN_APPLICATION_ID,
  roleId: MAIN_ROLE_ID,
};
const CUSTOM = { type: 'customApplication' };

const WITH_LIMITING_AGENT = { agentId: LIMITING_AGENT_ID };
const THROUGH_APPLICATION = { application: { id: APPLICATION_ID } };

const buildPrincipalPermissionsService = (cacheOverrides: object = {}) =>
  new PrincipalPermissionsService({
    getOrRecompute: async () => ({ ...CACHE_VALUES, ...cacheOverrides }),
  } as unknown as WorkspaceCacheService);

const buildDeletedApplicationCache = (applicationId: string) => ({
  flatApplicationMaps: {
    ...FLAT_APPLICATION_MAPS,
    byId: {
      ...FLAT_APPLICATION_MAPS.byId,
      [applicationId]: {
        ...FLAT_APPLICATION_MAPS.byId[applicationId],
        deletedAt: '2026-01-01T00:00:00.000Z',
      },
    },
  },
});

describe('PrincipalPermissionsService', () => {
  it.each<{
    it: string;
    authContext: object;
    mainPrincipal: object;
    limitingPrincipal?: object;
    applicationPrincipal: object;
    shareKeys: string[];
  }>([
    {
      it: 'a member',
      authContext: USER_AUTH_CONTEXT,
      mainPrincipal: MEMBER,
      applicationPrincipal: CUSTOM,
      shareKeys: [MEMBER_ID, MAIN_ROLE_ID],
    },
    {
      it: 'a member through an agent',
      authContext: { ...USER_AUTH_CONTEXT, ...WITH_LIMITING_AGENT },
      mainPrincipal: MEMBER,
      limitingPrincipal: LIMITING_AGENT,
      applicationPrincipal: CUSTOM,
      shareKeys: [MEMBER_ID, LIMITING_ROLE_ID, MAIN_ROLE_ID],
    },
    {
      it: 'a member through an application',
      authContext: { ...USER_AUTH_CONTEXT, ...THROUGH_APPLICATION },
      mainPrincipal: MEMBER,
      applicationPrincipal: ACTING_APPLICATION,
      shareKeys: [MEMBER_ID, MAIN_ROLE_ID, APPLICATION_ROLE_ID],
    },
    {
      it: 'a member through an agent and an application',
      authContext: {
        ...USER_AUTH_CONTEXT,
        ...WITH_LIMITING_AGENT,
        ...THROUGH_APPLICATION,
      },
      mainPrincipal: MEMBER,
      limitingPrincipal: LIMITING_AGENT,
      applicationPrincipal: ACTING_APPLICATION,
      shareKeys: [
        MEMBER_ID,
        LIMITING_ROLE_ID,
        MAIN_ROLE_ID,
        APPLICATION_ROLE_ID,
      ],
    },
    {
      it: 'a member through an OAuth application, with the member role',
      authContext: {
        ...USER_AUTH_CONTEXT,
        application: { id: OAUTH_APPLICATION_ID },
      },
      mainPrincipal: MEMBER,
      applicationPrincipal: {
        type: 'application',
        applicationId: OAUTH_APPLICATION_ID,
        roleId: MAIN_ROLE_ID,
      },
      shareKeys: [MEMBER_ID, MAIN_ROLE_ID],
    },
    {
      it: 'an API key',
      authContext: API_KEY_AUTH_CONTEXT,
      mainPrincipal: API_KEY,
      applicationPrincipal: CUSTOM,
      shareKeys: [MAIN_ROLE_ID],
    },
    {
      it: 'an API key running an agent',
      authContext: { ...API_KEY_AUTH_CONTEXT, ...WITH_LIMITING_AGENT },
      mainPrincipal: API_KEY,
      limitingPrincipal: LIMITING_AGENT,
      applicationPrincipal: CUSTOM,
      shareKeys: [LIMITING_ROLE_ID, MAIN_ROLE_ID],
    },
    {
      it: 'an application',
      authContext: APPLICATION_AUTH_CONTEXT,
      mainPrincipal: MAIN_APPLICATION,
      applicationPrincipal: MAIN_APPLICATION,
      shareKeys: [MAIN_ROLE_ID],
    },
    {
      it: 'an agent running in an application',
      authContext: {
        ...APPLICATION_AUTH_CONTEXT,
        ...THROUGH_APPLICATION,
        agentId: MAIN_AGENT_ID,
      },
      mainPrincipal: {
        type: 'agent',
        agentId: MAIN_AGENT_ID,
        roleId: MAIN_ROLE_ID,
      },
      applicationPrincipal: ACTING_APPLICATION,
      shareKeys: [MAIN_ROLE_ID, APPLICATION_ROLE_ID],
    },
    {
      it: 'a webhook',
      authContext: WEBHOOK_AUTH_CONTEXT,
      mainPrincipal: {
        type: 'webhook',
        webhookId: WEBHOOK_ID,
        roleId: MAIN_ROLE_ID,
      },
      applicationPrincipal: CUSTOM,
      shareKeys: [MAIN_ROLE_ID],
    },
  ])(
    'resolves $it',
    async ({
      authContext,
      mainPrincipal,
      limitingPrincipal,
      applicationPrincipal,
      shareKeys,
    }) => {
      const principals =
        await buildPrincipalPermissionsService().buildPermissionsPrincipalsOrThrow(
          { authContext: authContext as WorkspaceAuthContext },
        );

      expect(principals).toEqual({
        workspaceId: WORKSPACE_ID,
        mainPrincipal,
        limitingPrincipal,
        applicationPrincipal,
      });
      expect(getPermissionsPrincipalsShareKeys(principals).sort()).toEqual(
        [...shareKeys].sort(),
      );
      expect(getPermissionsPrincipalsRoleIds(principals)).not.toContain(
        MEMBER_ID,
      );
    },
  );

  it('carries the AI run scope', async () => {
    const aiRunScope = { recordsPermissions: {}, permissionFlags: {} };

    expect(
      await buildPrincipalPermissionsService().buildPermissionsPrincipals({
        authContext: {
          ...USER_AUTH_CONTEXT,
          aiRunScope,
        } as unknown as WorkspaceAuthContext,
      }),
    ).toMatchObject({ aiRunScope });
  });

  it.each<{ it: string; authContext: object; cacheOverrides?: object }>([
    {
      it: 'a system context',
      authContext: { type: 'system', workspace: { id: WORKSPACE_ID } },
    },
    {
      it: 'a pending activation user',
      authContext: {
        type: 'pendingActivationUser',
        workspace: { id: WORKSPACE_ID },
        userWorkspaceId: USER_WORKSPACE_ID,
      },
    },
    {
      it: 'a member with no role',
      authContext: USER_AUTH_CONTEXT,
      cacheOverrides: { userWorkspaceRoleMap: {} },
    },
    {
      it: 'a key with no role',
      authContext: API_KEY_AUTH_CONTEXT,
      cacheOverrides: { apiKeyRoleMap: {} },
    },
    {
      it: 'a limiting agent that lost its role',
      authContext: { ...USER_AUTH_CONTEXT, ...WITH_LIMITING_AGENT },
      cacheOverrides: { flatRoleTargetByAgentIdMaps: {} },
    },
    {
      it: 'a member through a deleted application',
      authContext: { ...USER_AUTH_CONTEXT, ...THROUGH_APPLICATION },
      cacheOverrides: buildDeletedApplicationCache(APPLICATION_ID),
    },
    {
      it: 'a member through an application with no role',
      authContext: {
        ...USER_AUTH_CONTEXT,
        application: { id: ROLELESS_APPLICATION_ID },
      },
    },
    {
      it: 'an API key through an OAuth application',
      authContext: {
        ...API_KEY_AUTH_CONTEXT,
        application: { id: OAUTH_APPLICATION_ID },
      },
    },
    {
      it: 'a deleted application alone',
      authContext: APPLICATION_AUTH_CONTEXT,
      cacheOverrides: buildDeletedApplicationCache(MAIN_APPLICATION_ID),
    },
  ])('gives no principals to $it', async ({ authContext, cacheOverrides }) => {
    expect(
      await buildPrincipalPermissionsService(
        cacheOverrides,
      ).buildPermissionsPrincipals({
        authContext: authContext as WorkspaceAuthContext,
      }),
    ).toBeUndefined();
  });
});
