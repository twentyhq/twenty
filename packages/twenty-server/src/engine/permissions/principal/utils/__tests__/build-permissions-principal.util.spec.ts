import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { type RoleIdsBySource } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { buildPermissionsPrincipal } from 'src/engine/permissions/principal/utils/build-permissions-principal.util';
import { getPermissionsPrincipalActingApplicationId } from 'src/engine/permissions/principal/utils/get-permissions-principal-acting-application-id.util';
import { getPermissionsPrincipalRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principal-role-ids.util';

const WORKSPACE_ID = 'workspace-1';
const MEMBER_ID = 'member-1';
const USER_ROLE_ID = 'user-role';
const AGENT_ROLE_ID = 'agent-role';
const APPLICATION_ROLE_ID = 'application-role';
const APPLICATION_ID = 'application-1';

const flatApplicationMaps: ApplicationDefaultRoleMaps = {
  byId: {
    [APPLICATION_ID]: {
      id: APPLICATION_ID,
      defaultRoleId: APPLICATION_ROLE_ID,
      deletedAt: null,
    },
  },
};

const build = (intersectionOf: RoleIdsBySource) =>
  buildPermissionsPrincipal({
    workspaceId: WORKSPACE_ID,
    rolePermissionConfig: { intersectionOf },
    workspaceMemberId: MEMBER_ID,
  });

describe('buildPermissionsPrincipal', () => {
  it('returns undefined when permission checks are bypassed', () => {
    expect(
      buildPermissionsPrincipal({
        workspaceId: WORKSPACE_ID,
        rolePermissionConfig: { shouldBypassPermissionChecks: true },
        workspaceMemberId: MEMBER_ID,
      }),
    ).toBeUndefined();
  });

  it('places the user, agent and application roles in their slots', () => {
    expect(
      build({
        userWorkspaceRoleId: USER_ROLE_ID,
        agentRoleId: AGENT_ROLE_ID,
        applicationRoleId: APPLICATION_ROLE_ID,
      }),
    ).toEqual({
      workspaceId: WORKSPACE_ID,
      main: { roleId: USER_ROLE_ID, workspaceMemberId: MEMBER_ID },
      limitingRoleId: AGENT_ROLE_ID,
      appRoleId: APPLICATION_ROLE_ID,
    });
  });

  it('leaves main empty for an application acting alone', () => {
    expect(build({ applicationRoleId: APPLICATION_ROLE_ID })).toEqual({
      workspaceId: WORKSPACE_ID,
      main: undefined,
      limitingRoleId: undefined,
      appRoleId: APPLICATION_ROLE_ID,
    });
  });

  it('keeps a member without a role as a denying main slot', () => {
    expect(
      build({ userWorkspaceRoleId: null, apiKeyRoleId: undefined })?.main,
    ).toEqual({ roleId: null, workspaceMemberId: MEMBER_ID });
  });
});

describe('getPermissionsPrincipalRoleIds', () => {
  it('lists the limiting role first and drops duplicates', () => {
    expect(
      getPermissionsPrincipalRoleIds({
        main: { roleId: USER_ROLE_ID },
        limitingRoleId: AGENT_ROLE_ID,
        appRoleId: USER_ROLE_ID,
      }),
    ).toEqual([AGENT_ROLE_ID, USER_ROLE_ID]);
  });

  it('grants no role when a slot takes part without one', () => {
    expect(
      getPermissionsPrincipalRoleIds({
        main: { roleId: USER_ROLE_ID },
        limitingRoleId: null,
      }),
    ).toEqual([]);
  });

  it('grants no role to an empty principal', () => {
    expect(getPermissionsPrincipalRoleIds({})).toEqual([]);
  });
});

describe('getPermissionsPrincipalActingApplicationId', () => {
  it('resolves the application whose default role is the app role', () => {
    expect(
      getPermissionsPrincipalActingApplicationId({
        principal: {
          main: { roleId: USER_ROLE_ID },
          appRoleId: APPLICATION_ROLE_ID,
        },
        flatApplicationMaps,
      }),
    ).toBe(APPLICATION_ID);
  });

  it('ignores an app role that is also the main role', () => {
    expect(
      getPermissionsPrincipalActingApplicationId({
        principal: {
          main: { roleId: APPLICATION_ROLE_ID },
          appRoleId: APPLICATION_ROLE_ID,
        },
        flatApplicationMaps,
      }),
    ).toBeUndefined();
  });

  it('ignores a principal that grants no role', () => {
    expect(
      getPermissionsPrincipalActingApplicationId({
        principal: { main: { roleId: null }, appRoleId: APPLICATION_ROLE_ID },
        flatApplicationMaps,
      }),
    ).toBeUndefined();
  });
});
