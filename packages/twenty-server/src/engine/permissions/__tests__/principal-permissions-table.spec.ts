import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildMatrixServices } from 'src/engine/permissions/__tests__/record-access-matrix/build-matrix-services.util';
import {
  LIMITING_ROLE_ID,
  MAIN_ROLE_ID,
  WORKSPACE_MEMBER_ID,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.model';
import {
  AGENT_ID,
  API_KEY_AUTH_CONTEXT,
  API_KEY_ID,
  APPLICATION_ID,
  buildMatrixCacheValues,
  MAIN_APPLICATION_ID,
  OAUTH_APPLICATION_ID,
  USER_AUTH_CONTEXT,
  USER_WORKSPACE_ID,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.world';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { getPermissionsPrincipalsShareKeys } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-share-keys.util';

const toAuthContext = (authContext: object) =>
  authContext as WorkspaceAuthContext;

const baseCacheValues = buildMatrixCacheValues({
  mainRoleGrant: 'allRecords',
  limitingRoleGrant: 'allRecords',
  isSharingEnabled: false,
});
const APPLICATION_AUTH_CONTEXT = {
  type: 'application',
  workspace: { id: WORKSPACE_ID },
  application: { id: MAIN_APPLICATION_ID },
};

describe('principal permissions table', () => {
  it.each<[string, object, string[], string[]]>([
    [
      'member',
      USER_AUTH_CONTEXT,
      [MAIN_ROLE_ID],
      [WORKSPACE_MEMBER_ID, MAIN_ROLE_ID],
    ],
    [
      'member acting through an agent',
      { ...USER_AUTH_CONTEXT, agentId: AGENT_ID },
      [LIMITING_ROLE_ID, MAIN_ROLE_ID],
      [WORKSPACE_MEMBER_ID, LIMITING_ROLE_ID, MAIN_ROLE_ID],
    ],
    [
      'member acting through an application',
      { ...USER_AUTH_CONTEXT, application: { id: APPLICATION_ID } },
      [MAIN_ROLE_ID, LIMITING_ROLE_ID],
      [WORKSPACE_MEMBER_ID, MAIN_ROLE_ID, LIMITING_ROLE_ID],
    ],
    [
      'member acting through an OAuth application',
      { ...USER_AUTH_CONTEXT, application: { id: OAUTH_APPLICATION_ID } },
      [MAIN_ROLE_ID],
      [WORKSPACE_MEMBER_ID, MAIN_ROLE_ID],
    ],
    ['API key', API_KEY_AUTH_CONTEXT, [MAIN_ROLE_ID], [MAIN_ROLE_ID]],
    [
      'API key running an agent',
      { ...API_KEY_AUTH_CONTEXT, agentId: AGENT_ID },
      [LIMITING_ROLE_ID, MAIN_ROLE_ID],
      [LIMITING_ROLE_ID, MAIN_ROLE_ID],
    ],
    ['application', APPLICATION_AUTH_CONTEXT, [MAIN_ROLE_ID], [MAIN_ROLE_ID]],
  ])('resolves %s', async (_name, authContext, roleIds, shareKeys) => {
    const principals = await buildMatrixServices(
      baseCacheValues,
    ).principalPermissionsService.buildPermissionsPrincipals({
      authContext: toAuthContext(authContext),
    });

    expect(principals).toBeDefined();
    expect(getPermissionsPrincipalsRoleIds(principals!).sort()).toEqual(
      [...roleIds].sort(),
    );
    expect(getPermissionsPrincipalsShareKeys(principals!).sort()).toEqual(
      [...shareKeys].sort(),
    );
  });

  it.each<[string, object, object]>([
    [
      'a system context',
      { type: 'system', workspace: { id: WORKSPACE_ID } },
      {},
    ],
    [
      'a pending activation user',
      {
        type: 'pendingActivationUser',
        workspace: { id: WORKSPACE_ID },
        userWorkspaceId: USER_WORKSPACE_ID,
      },
      {},
    ],
    ['a member with no role', USER_AUTH_CONTEXT, { userWorkspaceRoleMap: {} }],
    [
      'a key with no role',
      API_KEY_AUTH_CONTEXT,
      { apiKeyRoleMap: { [`not-${API_KEY_ID}`]: MAIN_ROLE_ID } },
    ],
    [
      'a limiting agent that lost its role',
      { ...USER_AUTH_CONTEXT, agentId: AGENT_ID },
      { flatRoleTargetByAgentIdMaps: {} },
    ],
    [
      'a member through a deleted application',
      { ...USER_AUTH_CONTEXT, application: { id: APPLICATION_ID } },
      {
        flatApplicationMaps: {
          ...baseCacheValues.flatApplicationMaps,
          byId: {
            ...baseCacheValues.flatApplicationMaps.byId,
            [APPLICATION_ID]: {
              ...baseCacheValues.flatApplicationMaps.byId[APPLICATION_ID],
              deletedAt: '2026-01-01T00:00:00.000Z',
            },
          },
        },
      },
    ],
    [
      'a deleted application alone',
      APPLICATION_AUTH_CONTEXT,
      {
        flatApplicationMaps: {
          ...baseCacheValues.flatApplicationMaps,
          byId: {
            ...baseCacheValues.flatApplicationMaps.byId,
            [MAIN_APPLICATION_ID]: {
              ...baseCacheValues.flatApplicationMaps.byId[MAIN_APPLICATION_ID],
              deletedAt: '2026-01-01T00:00:00.000Z',
            },
          },
        },
      },
    ],
  ])('holds no role for %s', async (_name, authContext, cacheOverrides) => {
    expect(
      await buildMatrixServices({
        ...baseCacheValues,
        ...cacheOverrides,
      }).principalPermissionsService.buildPermissionsPrincipals({
        authContext: toAuthContext(authContext),
      }),
    ).toBeUndefined();
  });
});
