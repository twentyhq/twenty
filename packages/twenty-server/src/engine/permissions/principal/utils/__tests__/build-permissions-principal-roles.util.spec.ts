import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { buildPermissionsPrincipalRoles } from 'src/engine/permissions/principal/utils/build-permissions-principal-roles.util';

const MEMBER_ID = 'member-1';
const AGENT_ID = 'agent-1';
const APPLICATION_ID = 'application-1';
const USER_ROLE_ID = 'user-role';
const AGENT_ROLE_ID = 'agent-role';
const APPLICATION_ROLE_ID = 'application-role';

const MEMBER_PRINCIPALS: PermissionsPrincipalsContext = {
  workspaceId: 'workspace-1',
  mainPrincipal: { type: 'workspaceMember', workspaceMemberId: MEMBER_ID },
  limitingPrincipal: { type: 'agent', agentId: AGENT_ID },
  applicationPrincipal: { type: 'application', applicationId: APPLICATION_ID },
};

describe('buildPermissionsPrincipalRoles', () => {
  it('places the member, agent and application in their slots', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: {
          userWorkspaceRoleId: USER_ROLE_ID,
          agentRoleId: AGENT_ROLE_ID,
          applicationRoleId: APPLICATION_ROLE_ID,
        },
        principalsContext: MEMBER_PRINCIPALS,
      }),
    ).toEqual({
      mainPrincipal: {
        type: 'workspaceMember',
        roleId: USER_ROLE_ID,
        workspaceMemberId: MEMBER_ID,
      },
      limitingPrincipal: {
        type: 'agent',
        roleId: AGENT_ROLE_ID,
        agentId: AGENT_ID,
      },
      applicationPrincipal: {
        type: 'application',
        roleId: APPLICATION_ROLE_ID,
        applicationId: APPLICATION_ID,
      },
    });
  });

  it('uses the custom app when no application takes part', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: { apiKeyRoleId: 'api-key-role' },
        principalsContext: {
          workspaceId: 'workspace-1',
          mainPrincipal: { type: 'apiKey', apiKeyId: 'api-key-1' },
          applicationPrincipal: { type: 'customApplication' },
        },
      }),
    ).toEqual({
      mainPrincipal: {
        type: 'apiKey',
        roleId: 'api-key-role',
        apiKeyId: 'api-key-1',
      },
      limitingPrincipal: undefined,
      applicationPrincipal: { type: 'customApplication' },
    });
  });

  it('puts an application acting alone in main and app', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: { applicationRoleId: APPLICATION_ROLE_ID },
        principalsContext: {
          workspaceId: 'workspace-1',
          mainPrincipal: { type: 'application', applicationId: APPLICATION_ID },
          applicationPrincipal: {
            type: 'application',
            applicationId: APPLICATION_ID,
          },
        },
      }),
    ).toEqual({
      mainPrincipal: {
        type: 'application',
        roleId: APPLICATION_ROLE_ID,
        applicationId: APPLICATION_ID,
      },
      limitingPrincipal: undefined,
      applicationPrincipal: {
        type: 'application',
        roleId: APPLICATION_ROLE_ID,
        applicationId: APPLICATION_ID,
      },
    });
  });

  it('treats an agent or application without a role as the custom app', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: {
          userWorkspaceRoleId: USER_ROLE_ID,
          agentRoleId: null,
          applicationRoleId: null,
        },
        principalsContext: MEMBER_PRINCIPALS,
      }),
    ).toEqual({
      mainPrincipal: {
        type: 'workspaceMember',
        roleId: USER_ROLE_ID,
        workspaceMemberId: MEMBER_ID,
      },
      limitingPrincipal: undefined,
      applicationPrincipal: { type: 'customApplication' },
    });
  });

  it('denies a member without a role', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: { userWorkspaceRoleId: null },
        principalsContext: MEMBER_PRINCIPALS,
      }),
    ).toBeUndefined();
  });

  it('denies when a source cannot be placed', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: {
          userWorkspaceRoleId: USER_ROLE_ID,
          apiKeyRoleId: 'api-key-role',
        },
        principalsContext: MEMBER_PRINCIPALS,
      }),
    ).toBeUndefined();
  });

  it('marks roles without a known principal as deprecated role-only', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: { agentRoleId: AGENT_ROLE_ID },
        principalsContext: undefined,
      }),
    ).toEqual({
      mainPrincipal: { type: 'deprecatedRoleOnly', roleId: AGENT_ROLE_ID },
      limitingPrincipal: undefined,
      applicationPrincipal: { type: 'customApplication' },
    });
  });
});
