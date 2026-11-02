import { getPermissionsPrincipalRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principal-role-ids.util';

describe('getPermissionsPrincipalRoleIds', () => {
  it('lists the limiting role first and drops duplicates', () => {
    expect(
      getPermissionsPrincipalRoleIds({
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
      getPermissionsPrincipalRoleIds({
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
