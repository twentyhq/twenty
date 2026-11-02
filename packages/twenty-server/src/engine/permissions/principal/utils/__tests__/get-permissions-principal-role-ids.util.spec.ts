import { WORKSPACE_APP_ROLE_ID } from 'src/engine/permissions/principal/constants/workspace-app-role-id.constant';
import { getPermissionsPrincipalRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principal-role-ids.util';

describe('getPermissionsPrincipalRoleIds', () => {
  it('lists the limiting role first and drops duplicates', () => {
    expect(
      getPermissionsPrincipalRoleIds({
        main: { roleId: 'user-role' },
        limitingRoleId: 'agent-role',
        appRoleId: 'user-role',
      }),
    ).toEqual(['agent-role', 'user-role']);
  });

  it('leaves the workspace app out of the intersection', () => {
    expect(
      getPermissionsPrincipalRoleIds({
        main: { roleId: 'user-role' },
        appRoleId: WORKSPACE_APP_ROLE_ID,
      }),
    ).toEqual(['user-role']);
  });

  it('grants no role when a slot takes part without one', () => {
    expect(
      getPermissionsPrincipalRoleIds({
        main: { roleId: 'user-role' },
        limitingRoleId: null,
        appRoleId: WORKSPACE_APP_ROLE_ID,
      }),
    ).toEqual([]);
  });
});
