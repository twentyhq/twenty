import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { getPermissionsPrincipalsActingApplicationId } from 'src/engine/permissions/principal/utils/get-permissions-principals-acting-application-id.util';

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

describe('getPermissionsPrincipalsActingApplicationId', () => {
  it('returns the application a member acts through', () => {
    expect(
      getPermissionsPrincipalsActingApplicationId({
        principals: {
          mainPrincipal: {
            type: 'workspaceMember',
            roleId: 'user-role',
            workspaceMemberId: 'member-1',
          },
          applicationPrincipal: {
            type: 'application',
            roleId: APPLICATION_ROLE_ID,
            applicationId: APPLICATION_ID,
          },
        },
        flatApplicationMaps,
      }),
    ).toBe(APPLICATION_ID);
  });

  it('returns the application acting alone', () => {
    expect(
      getPermissionsPrincipalsActingApplicationId({
        principals: {
          mainPrincipal: {
            type: 'application',
            roleId: APPLICATION_ROLE_ID,
            applicationId: APPLICATION_ID,
          },
          applicationPrincipal: {
            type: 'application',
            roleId: APPLICATION_ROLE_ID,
            applicationId: APPLICATION_ID,
          },
        },
        flatApplicationMaps,
      }),
    ).toBe(APPLICATION_ID);
  });

  it('looks up the application of a deprecated role-only app', () => {
    expect(
      getPermissionsPrincipalsActingApplicationId({
        principals: {
          mainPrincipal: { type: 'deprecatedRoleOnly', roleId: 'user-role' },
          applicationPrincipal: {
            type: 'deprecatedRoleOnly',
            roleId: APPLICATION_ROLE_ID,
          },
        },
        flatApplicationMaps,
      }),
    ).toBe(APPLICATION_ID);
  });

  it('keeps the owning application of a role-only application config', () => {
    expect(
      getPermissionsPrincipalsActingApplicationId({
        principals: {
          mainPrincipal: {
            type: 'deprecatedRoleOnly',
            roleId: APPLICATION_ROLE_ID,
          },
          applicationPrincipal: {
            type: 'deprecatedRoleOnly',
            roleId: APPLICATION_ROLE_ID,
          },
        },
        flatApplicationMaps,
      }),
    ).toBe(APPLICATION_ID);
  });

  it('ignores an app role the member also holds', () => {
    expect(
      getPermissionsPrincipalsActingApplicationId({
        principals: {
          mainPrincipal: {
            type: 'workspaceMember',
            roleId: APPLICATION_ROLE_ID,
            workspaceMemberId: 'member-1',
          },
          applicationPrincipal: {
            type: 'application',
            roleId: APPLICATION_ROLE_ID,
            applicationId: APPLICATION_ID,
          },
        },
        flatApplicationMaps,
      }),
    ).toBeUndefined();
  });

  it('ignores the custom app', () => {
    expect(
      getPermissionsPrincipalsActingApplicationId({
        principals: {
          mainPrincipal: {
            type: 'workspaceMember',
            roleId: 'user-role',
            workspaceMemberId: 'member-1',
          },
          applicationPrincipal: { type: 'customApplication' },
        },
        flatApplicationMaps,
      }),
    ).toBeUndefined();
  });
});
