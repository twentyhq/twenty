import { WORKSPACE_APP_ROLE_ID } from 'src/engine/permissions/principal/constants/workspace-app-role-id.constant';
import { buildPermissionsPrincipalRoles } from 'src/engine/permissions/principal/utils/build-permissions-principal-roles.util';

const MEMBER_ID = 'member-1';
const USER_ROLE_ID = 'user-role';
const API_KEY_ROLE_ID = 'api-key-role';
const AGENT_ROLE_ID = 'agent-role';
const APPLICATION_ROLE_ID = 'application-role';
const APPLICATION_ID = 'application-1';

describe('buildPermissionsPrincipalRoles', () => {
  it('places the member, agent and application roles in their slots', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: {
          userWorkspaceRoleId: USER_ROLE_ID,
          agentRoleId: AGENT_ROLE_ID,
          applicationRoleId: APPLICATION_ROLE_ID,
        },
        mainActor: { workspaceMemberId: MEMBER_ID },
      }),
    ).toEqual({
      main: { roleId: USER_ROLE_ID, workspaceMemberId: MEMBER_ID },
      limitingRoleId: AGENT_ROLE_ID,
      appRoleId: APPLICATION_ROLE_ID,
    });
  });

  it('uses the workspace app when no application takes part', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: { apiKeyRoleId: API_KEY_ROLE_ID },
        mainActor: { apiKeyId: 'api-key-1' },
      }),
    ).toEqual({
      main: { roleId: API_KEY_ROLE_ID, apiKeyId: 'api-key-1' },
      limitingRoleId: undefined,
      appRoleId: WORKSPACE_APP_ROLE_ID,
    });
  });

  it('puts the role of an application acting alone in main and app', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: { applicationRoleId: APPLICATION_ROLE_ID },
        mainActor: { applicationId: APPLICATION_ID },
      }),
    ).toEqual({
      main: { roleId: APPLICATION_ROLE_ID, applicationId: APPLICATION_ID },
      limitingRoleId: undefined,
      appRoleId: APPLICATION_ROLE_ID,
    });
  });

  it('keeps the member on a role-less main when the config names no role', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: {},
        mainActor: { workspaceMemberId: MEMBER_ID },
      }).main,
    ).toEqual({ roleId: null, workspaceMemberId: MEMBER_ID });
  });

  it('denies the main role when a source cannot be placed', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: {
          userWorkspaceRoleId: USER_ROLE_ID,
          apiKeyRoleId: null,
        },
        mainActor: { workspaceMemberId: MEMBER_ID },
      }).main,
    ).toEqual({ roleId: null, workspaceMemberId: MEMBER_ID });
  });

  it('makes an agent running on its own the main role', () => {
    expect(
      buildPermissionsPrincipalRoles({
        roleIdsBySource: { agentRoleId: AGENT_ROLE_ID },
        mainActor: undefined,
      }),
    ).toEqual({
      main: { roleId: AGENT_ROLE_ID },
      limitingRoleId: undefined,
      appRoleId: WORKSPACE_APP_ROLE_ID,
    });
  });
});
