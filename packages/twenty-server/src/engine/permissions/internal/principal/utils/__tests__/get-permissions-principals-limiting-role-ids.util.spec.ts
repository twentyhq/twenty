import { getPermissionsPrincipalsLimitingRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-limiting-role-ids.util';

describe('getPermissionsPrincipalsLimitingRoleIds', () => {
  it('lists the agent and application roles', () => {
    expect(
      getPermissionsPrincipalsLimitingRoleIds({
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

  it('keeps an application acting with one of the main roles', () => {
    expect(
      getPermissionsPrincipalsLimitingRoleIds({
        applicationPrincipal: {
          type: 'application',
          roleId: 'user-role',
          applicationId: 'application-1',
        },
      }),
    ).toEqual(['user-role']);
  });

  it('leaves out an application without a role of its own', () => {
    expect(
      getPermissionsPrincipalsLimitingRoleIds({
        applicationPrincipal: {
          type: 'application',
          applicationId: 'application-1',
        },
      }),
    ).toEqual([]);
  });

  it('leaves out the custom application', () => {
    expect(
      getPermissionsPrincipalsLimitingRoleIds({
        applicationPrincipal: { type: 'customApplication' },
      }),
    ).toEqual([]);
  });
});
