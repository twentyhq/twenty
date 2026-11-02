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
  it('returns the application a member acts through', () => {
    expect(
      getPermissionsPrincipalActingApplicationId({
        principal: {
          mainPrincipal: { roleId: 'user-role', workspaceMemberId: 'member-1' },
          applicationPrincipal: {
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
      getPermissionsPrincipalActingApplicationId({
        principal: {
          mainPrincipal: {
            roleId: APPLICATION_ROLE_ID,
            applicationId: APPLICATION_ID,
          },
          applicationPrincipal: {
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
      getPermissionsPrincipalActingApplicationId({
        principal: {
          mainPrincipal: { roleId: 'user-role', isDeprecatedRoleOnly: true },
          applicationPrincipal: {
            roleId: APPLICATION_ROLE_ID,
            isDeprecatedRoleOnly: true,
          },
        },
        flatApplicationMaps,
      }),
    ).toBe(APPLICATION_ID);
  });

  it('keeps the owning application of a role-only application config', () => {
    expect(
      getPermissionsPrincipalActingApplicationId({
        principal: {
          mainPrincipal: {
            roleId: APPLICATION_ROLE_ID,
            isDeprecatedRoleOnly: true,
          },
          applicationPrincipal: {
            roleId: APPLICATION_ROLE_ID,
            isDeprecatedRoleOnly: true,
          },
        },
        flatApplicationMaps,
      }),
    ).toBe(APPLICATION_ID);
  });

  it('ignores an app role the member also holds', () => {
    expect(
      getPermissionsPrincipalActingApplicationId({
        principal: {
          mainPrincipal: {
            roleId: APPLICATION_ROLE_ID,
            workspaceMemberId: 'member-1',
          },
          applicationPrincipal: {
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
      getPermissionsPrincipalActingApplicationId({
        principal: {
          mainPrincipal: { roleId: 'user-role', workspaceMemberId: 'member-1' },
          applicationPrincipal: { isCustomApp: true },
        },
        flatApplicationMaps,
      }),
    ).toBeUndefined();
  });
});
