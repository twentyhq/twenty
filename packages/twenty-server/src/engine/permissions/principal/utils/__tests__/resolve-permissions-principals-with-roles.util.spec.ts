import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type PermissionsPrincipalRoleMaps } from 'src/engine/permissions/principal/types/permissions-principal-role-maps.type';
import { resolvePermissionsPrincipalsWithRoles } from 'src/engine/permissions/principal/utils/resolve-permissions-principals-with-roles.util';

const WORKSPACE_ID = 'workspace-1';
const MEMBER_ID = 'member-1';
const AGENT_ID = 'agent-1';
const APPLICATION_ID = 'application-1';
const OAUTH_APPLICATION_ID = 'oauth-application-1';

const roleMaps: PermissionsPrincipalRoleMaps = {
  flatWorkspaceMemberMaps: {
    byId: { [MEMBER_ID]: { id: MEMBER_ID, userId: 'user-1' } },
    userWorkspaceIdByUserId: { 'user-1': 'user-workspace-1' },
  } as unknown as PermissionsPrincipalRoleMaps['flatWorkspaceMemberMaps'],
  userWorkspaceRoleMap: { 'user-workspace-1': 'member-role' },
  apiKeyRoleMap: { 'api-key-1': 'api-key-role' },
  flatRoleTargetByAgentIdMaps: {
    [AGENT_ID]: { roleId: 'agent-role' } as FlatRoleTarget,
  },
  flatApplicationMaps: {
    byId: {
      [APPLICATION_ID]: {
        id: APPLICATION_ID,
        defaultRoleId: 'application-role',
        sourceType: ApplicationRegistrationSourceType.NPM,
        deletedAt: null,
      },
      [OAUTH_APPLICATION_ID]: {
        id: OAUTH_APPLICATION_ID,
        defaultRoleId: null,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        deletedAt: null,
      },
    },
  },
};

describe('resolvePermissionsPrincipalsWithRoles', () => {
  it('resolves the member, agent and application roles from the caches', () => {
    expect(
      resolvePermissionsPrincipalsWithRoles({
        principalsContext: {
          workspaceId: WORKSPACE_ID,
          mainPrincipal: { workspaceMemberId: MEMBER_ID },
          limitingPrincipal: { agentId: AGENT_ID },
          applicationPrincipal: { applicationId: APPLICATION_ID },
        },
        roleMaps,
      }),
    ).toEqual({
      workspaceId: WORKSPACE_ID,
      mainPrincipal: { workspaceMemberId: MEMBER_ID, roleId: 'member-role' },
      limitingPrincipal: { agentId: AGENT_ID, roleId: 'agent-role' },
      applicationPrincipal: {
        applicationId: APPLICATION_ID,
        roleId: 'application-role',
      },
    });
  });

  it('lets an OAuth-only application act with the member role', () => {
    expect(
      resolvePermissionsPrincipalsWithRoles({
        principalsContext: {
          workspaceId: WORKSPACE_ID,
          mainPrincipal: { workspaceMemberId: MEMBER_ID },
          applicationPrincipal: { applicationId: OAUTH_APPLICATION_ID },
        },
        roleMaps,
      })?.applicationPrincipal,
    ).toEqual({ applicationId: OAUTH_APPLICATION_ID, roleId: 'member-role' });
  });

  it('treats an agent without a role as no limit', () => {
    expect(
      resolvePermissionsPrincipalsWithRoles({
        principalsContext: {
          workspaceId: WORKSPACE_ID,
          mainPrincipal: { apiKeyId: 'api-key-1' },
          limitingPrincipal: { agentId: 'agent-without-role' },
          applicationPrincipal: { isCustomApp: true },
        },
        roleMaps,
      })?.limitingPrincipal,
    ).toBeUndefined();
  });

  it('denies a main principal without a role', () => {
    expect(
      resolvePermissionsPrincipalsWithRoles({
        principalsContext: {
          workspaceId: WORKSPACE_ID,
          mainPrincipal: { workspaceMemberId: 'unknown-member' },
          applicationPrincipal: { isCustomApp: true },
        },
        roleMaps,
      }),
    ).toBeUndefined();
  });
});
