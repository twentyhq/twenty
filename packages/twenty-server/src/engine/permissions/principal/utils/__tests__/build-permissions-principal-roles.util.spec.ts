import { type PermissionsPrincipals } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { buildPermissionsPrincipalRoles } from 'src/engine/permissions/principal/utils/build-permissions-principal-roles.util';

const MEMBER_ID = 'member-1';
const AGENT_ID = 'agent-1';
const APPLICATION_ID = 'application-1';
const USER_ROLE_ID = 'user-role';
const AGENT_ROLE_ID = 'agent-role';
const APPLICATION_ROLE_ID = 'application-role';

const MEMBER_ACTORS: PermissionsPrincipals = {
  mainPrincipal: { workspaceMemberId: MEMBER_ID },
  agentId: AGENT_ID,
  applicationId: APPLICATION_ID,
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
        principals: MEMBER_ACTORS,
      }),
    ).toEqual({
      mainPrincipal: { roleId: USER_ROLE_ID, workspaceMemberId: MEMBER_ID },
      limitingPrincipal: { roleId: AGENT_ROLE_ID, agentId: AGENT_ID },
      applicationPrincipal: {
        roleId: APPLICATION_ROLE_ID,
        applicationId: APPLICATION_ID,
      },
    });
  });

  it('uses the custom app when no application takes part', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: { apiKeyRoleId: 'api-key-role' },
        principals: {
          mainPrincipal: { apiKeyId: 'api-key-1' },
          agentId: undefined,
          applicationId: undefined,
        },
      }),
    ).toEqual({
      mainPrincipal: { roleId: 'api-key-role', apiKeyId: 'api-key-1' },
      limitingPrincipal: undefined,
      applicationPrincipal: { isCustomApp: true },
    });
  });

  it('puts an application acting alone in main and app', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: { applicationRoleId: APPLICATION_ROLE_ID },
        principals: {
          mainPrincipal: { applicationId: APPLICATION_ID },
          agentId: undefined,
          applicationId: APPLICATION_ID,
        },
      }),
    ).toEqual({
      mainPrincipal: {
        roleId: APPLICATION_ROLE_ID,
        applicationId: APPLICATION_ID,
      },
      limitingPrincipal: undefined,
      applicationPrincipal: {
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
        principals: MEMBER_ACTORS,
      }),
    ).toEqual({
      mainPrincipal: { roleId: USER_ROLE_ID, workspaceMemberId: MEMBER_ID },
      limitingPrincipal: undefined,
      applicationPrincipal: { isCustomApp: true },
    });
  });

  it('denies a member without a role', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: { userWorkspaceRoleId: null },
        principals: MEMBER_ACTORS,
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
        principals: MEMBER_ACTORS,
      }),
    ).toBeUndefined();
  });

  it('marks roles without a known principal as deprecated role-only', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: { agentRoleId: AGENT_ROLE_ID },
        principals: {
          mainPrincipal: undefined,
          agentId: undefined,
          applicationId: undefined,
        },
      }),
    ).toEqual({
      mainPrincipal: { roleId: AGENT_ROLE_ID, isDeprecatedRoleOnly: true },
      limitingPrincipal: undefined,
      applicationPrincipal: { isCustomApp: true },
    });
  });
});
