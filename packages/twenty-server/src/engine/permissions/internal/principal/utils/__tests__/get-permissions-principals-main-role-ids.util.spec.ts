import { getPermissionsPrincipalsMainRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-main-role-ids.util';

describe('getPermissionsPrincipalsMainRoleIds', () => {
  it('lists the main role alone when it holds no system side effect role', () => {
    expect(
      getPermissionsPrincipalsMainRoleIds({
        mainPrincipal: {
          type: 'apiKey',
          roleId: 'main-role',
          apiKeyId: 'key-1',
        },
      }),
    ).toEqual(['main-role']);
  });

  it('lists the main role first and drops duplicates', () => {
    expect(
      getPermissionsPrincipalsMainRoleIds({
        mainPrincipal: {
          type: 'workspaceMember',
          roleId: 'main-role',
          systemSideEffectRoleIds: ['personal-role', 'main-role'],
          workspaceMemberId: 'member-1',
        },
      }),
    ).toEqual(['main-role', 'personal-role']);
  });
});
