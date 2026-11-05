import { getPermissionsPrincipalsActingApplicationId } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-acting-application-id.util';

const APPLICATION_ID = 'application-1';
const APPLICATION_ROLE_ID = 'application-role';

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
      }),
    ).toBeUndefined();
  });
});
