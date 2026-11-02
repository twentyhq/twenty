import { WORKSPACE_APP_ROLE_ID } from 'src/engine/permissions/principal/constants/workspace-app-role-id.constant';
import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { getPermissionsPrincipalActingApplicationId } from 'src/engine/permissions/principal/utils/get-permissions-principal-acting-application-id.util';

const APPLICATION_ID = 'application-1';
const APPLICATION_ROLE_ID = 'application-role';

const flatApplicationMaps: ApplicationDefaultRoleMaps = {
  byId: {
    [APPLICATION_ID]: {
      id: APPLICATION_ID,
      defaultRoleId: APPLICATION_ROLE_ID,
      deletedAt: null,
    },
  },
};

describe('getPermissionsPrincipalActingApplicationId', () => {
  it('resolves the application a member acts through from its role', () => {
    expect(
      getPermissionsPrincipalActingApplicationId({
        principal: {
          main: { roleId: 'user-role', workspaceMemberId: 'member-1' },
          appRoleId: APPLICATION_ROLE_ID,
        },
        flatApplicationMaps,
      }),
    ).toBe(APPLICATION_ID);
  });

  it('returns the application acting alone', () => {
    expect(
      getPermissionsPrincipalActingApplicationId({
        principal: {
          main: { roleId: APPLICATION_ROLE_ID, applicationId: APPLICATION_ID },
          appRoleId: APPLICATION_ROLE_ID,
        },
        flatApplicationMaps,
      }),
    ).toBe(APPLICATION_ID);
  });

  it('ignores an app role a member also holds', () => {
    expect(
      getPermissionsPrincipalActingApplicationId({
        principal: {
          main: { roleId: APPLICATION_ROLE_ID, workspaceMemberId: 'member-1' },
          appRoleId: APPLICATION_ROLE_ID,
        },
        flatApplicationMaps,
      }),
    ).toBeUndefined();
  });

  it('ignores the workspace app', () => {
    expect(
      getPermissionsPrincipalActingApplicationId({
        principal: {
          main: { roleId: 'user-role', workspaceMemberId: 'member-1' },
          appRoleId: WORKSPACE_APP_ROLE_ID,
        },
        flatApplicationMaps,
      }),
    ).toBeUndefined();
  });
});
