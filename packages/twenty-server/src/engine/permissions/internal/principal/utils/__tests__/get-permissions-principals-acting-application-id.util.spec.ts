import { isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { getPermissionsPrincipalsActingApplicationId } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-acting-application-id.util';
import { resolvePermissionsPrincipalsWithRoles } from 'src/engine/permissions/internal/principal/utils/resolve-permissions-principals-with-roles.util';

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

  describe('for a member holding Admin acting through twenty-standard', () => {
    const TWENTY_STANDARD_APPLICATION_ID = 'twenty-standard-application-id';
    const ADMIN_ROLE_ID = 'admin-role-id';

    const resolveActingApplicationId = (
      flatRoleTargetByApplicationIdMaps: Record<string, { roleId: string }>,
    ) => {
      const principals = resolvePermissionsPrincipalsWithRoles({
        authContext: {
          type: 'user',
          workspace: { id: 'workspace-id' },
          workspaceMemberId: 'member-1',
          application: { id: TWENTY_STANDARD_APPLICATION_ID },
        },
        roleMaps: {
          userWorkspaceRoleMap: { 'user-workspace-1': ADMIN_ROLE_ID },
          apiKeyRoleMap: {},
          flatRoleTargetByAgentIdMaps: {},
          flatRoleTargetByApplicationIdMaps,
          workspaceCustomApplicationId: 'workspace-custom-application-id',
          flatWorkspaceMemberMaps: {
            byId: { 'member-1': { userId: 'user-1' } },
            userWorkspaceIdByUserId: { 'user-1': 'user-workspace-1' },
          },
          flatApplicationMaps: {
            byId: {
              [TWENTY_STANDARD_APPLICATION_ID]: {
                id: TWENTY_STANDARD_APPLICATION_ID,
                defaultRoleId: ADMIN_ROLE_ID,
                sourceType: ApplicationRegistrationSourceType.LOCAL,
                deletedAt: null,
              },
            },
          },
        },
      });

      if (!isDefined(principals)) {
        throw new Error('The member should hold a role');
      }

      return getPermissionsPrincipalsActingApplicationId({ principals });
    };

    it('acts as no application while twenty-standard still runs with Admin', () => {
      expect(resolveActingApplicationId({})).toBeUndefined();
    });

    it('acts through twenty-standard once it runs with its grant', () => {
      expect(
        resolveActingApplicationId({
          [TWENTY_STANDARD_APPLICATION_ID]: { roleId: 'admin-grant-role-id' },
        }),
      ).toBe(TWENTY_STANDARD_APPLICATION_ID);
    });
  });
});
