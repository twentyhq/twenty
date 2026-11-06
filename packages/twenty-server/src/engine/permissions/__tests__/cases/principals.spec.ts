import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  API_KEY_AUTH_CONTEXT,
  APPLICATION_AUTH_CONTEXT,
  USER_AUTH_CONTEXT,
  WEBHOOK_AUTH_CONTEXT,
} from 'src/engine/permissions/__tests__/framework/build-auth-context.util';
import { buildPermissionCacheValues } from 'src/engine/permissions/__tests__/framework/build-permission-cache-values.util';
import { buildPermissionServices } from 'src/engine/permissions/__tests__/framework/build-permission-services.util';
import {
  API_KEY_ID,
  APPLICATION_ID,
  APPLICATION_ROLE_ID,
  LIMITING_AGENT_ID,
  LIMITING_ROLE_ID,
  MAIN_AGENT_ID,
  MAIN_APPLICATION_ID,
  MAIN_ROLE_ID,
  MEMBER_ID,
  OAUTH_APPLICATION_ID,
  USER_WORKSPACE_ID,
  WEBHOOK_ID,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { getPermissionsPrincipalsShareKeys } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-share-keys.util';

const CACHE_VALUES = buildPermissionCacheValues({});

const toAuthContext = (authContext: object) =>
  authContext as WorkspaceAuthContext;

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
const CUSTOM = { type: 'customApplication' };

const WITH_LIMITING_AGENT = { agentId: LIMITING_AGENT_ID };
const THROUGH_APPLICATION = { application: { id: APPLICATION_ID } };

const buildDeletedApplicationCache = (applicationId: string) => ({
  flatApplicationMaps: {
    ...CACHE_VALUES.flatApplicationMaps,
    byId: {
      ...CACHE_VALUES.flatApplicationMaps.byId,
      [applicationId]: {
        ...CACHE_VALUES.flatApplicationMaps.byId[applicationId],
        deletedAt: '2026-01-01T00:00:00.000Z',
      },
    },
  },
});

describe('an auth context resolves to its principals', () => {
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
      mainPrincipal: {
        type: 'application',
        applicationId: MAIN_APPLICATION_ID,
        roleId: MAIN_ROLE_ID,
      },
      applicationPrincipal: {
        type: 'application',
        applicationId: MAIN_APPLICATION_ID,
        roleId: MAIN_ROLE_ID,
      },
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
    '$it',
    async ({
      authContext,
      mainPrincipal,
      limitingPrincipal,
      applicationPrincipal,
      shareKeys,
    }) => {
      const principals = await buildPermissionServices({
        cacheValues: CACHE_VALUES,
      }).principalPermissionsService.buildPermissionsPrincipalsOrThrow({
        authContext: toAuthContext(authContext),
      });

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
  ])('$it holds no role', async ({ authContext, cacheOverrides }) => {
    expect(
      await buildPermissionServices({
        cacheValues: { ...CACHE_VALUES, ...cacheOverrides },
      }).principalPermissionsService.buildPermissionsPrincipals({
        authContext: toAuthContext(authContext),
      }),
    ).toBeUndefined();
  });
});
