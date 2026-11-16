import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';

describe('getPermissionsPrincipalsRoleIds', () => {
  it('lists the limiting role first and drops duplicates', () => {
    expect(
      getPermissionsPrincipalsRoleIds({
        mainPrincipal: {
          type: 'workspaceMember',
          roleId: 'user-role',
          workspaceMemberId: 'member-1',
        },
        limitingPrincipal: {
          type: 'agent',
          roleId: 'agent-role',
          agentId: 'agent-1',
        },
        applicationPrincipal: {
          type: 'application',
          roleId: 'user-role',
          applicationId: 'application-1',
        },
      }),
    ).toEqual(['agent-role', 'user-role']);
  });

  it('leaves the custom app out of the intersection', () => {
    expect(
      getPermissionsPrincipalsRoleIds({
        mainPrincipal: {
          type: 'workspaceMember',
          roleId: 'user-role',
          workspaceMemberId: 'member-1',
        },
        applicationPrincipal: { type: 'customApplication' },
      }),
    ).toEqual(['user-role']);
  });
});
