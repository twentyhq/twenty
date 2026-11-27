import { getPermissionsPrincipalsLimitingRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-limiting-role-ids.util';

const mainPrincipal = {
  type: 'workspaceMember' as const,
  roleIds: ['user-role'],
  workspaceMemberId: 'member-1',
};

describe('getPermissionsPrincipalsLimitingRoleIds', () => {
  it('lists the agent and application roles', () => {
    expect(
      getPermissionsPrincipalsLimitingRoleIds({
        mainPrincipal,
        limitingPrincipal: {
          type: 'agent',
          roleId: 'agent-role',
          agentId: 'agent-1',
        },
        applicationPrincipal: {
          type: 'application',
          roleId: 'application-role',
          applicationId: 'application-1',
        },
      }),
    ).toEqual(['agent-role', 'application-role']);
  });

  it('keeps an agent holding the same role as the main principal', () => {
    expect(
      getPermissionsPrincipalsLimitingRoleIds({
        mainPrincipal,
        limitingPrincipal: {
          type: 'agent',
          roleId: 'user-role',
          agentId: 'agent-1',
        },
        applicationPrincipal: { type: 'customApplication' },
      }),
    ).toEqual(['user-role']);
  });

  it('leaves out an application whose role the main principal was narrowed to', () => {
    expect(
      getPermissionsPrincipalsLimitingRoleIds({
        mainPrincipal,
        applicationPrincipal: {
          type: 'application',
          roleId: 'user-role',
          applicationId: 'application-1',
        },
      }),
    ).toEqual([]);
  });

  it('leaves out an application without a role of its own', () => {
    expect(
      getPermissionsPrincipalsLimitingRoleIds({
        mainPrincipal,
        applicationPrincipal: {
          type: 'application',
          applicationId: 'application-1',
        },
      }),
    ).toEqual([]);
  });
});
