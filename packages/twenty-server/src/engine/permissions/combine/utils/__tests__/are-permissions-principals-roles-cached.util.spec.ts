/* @license Enterprise */

import { arePermissionsPrincipalsRolesCached } from 'src/engine/permissions/combine/utils/are-permissions-principals-roles-cached.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/role/constants/no-role-records-permissions.constant';

const ROLE_IDS = ['main-role', 'limiting-role', 'application-role'];

const principals: PermissionsPrincipalsWithRolesContext = {
  workspaceId: 'workspace-id',
  mainPrincipal: {
    type: 'workspaceMember',
    workspaceMemberId: 'member-id',
    roleId: 'main-role',
  },
  limitingPrincipal: {
    type: 'agent',
    agentId: 'agent-id',
    roleId: 'limiting-role',
  },
  applicationPrincipal: {
    type: 'application',
    applicationId: 'application-id',
    roleId: 'application-role',
  },
};

const buildRolesPermissions = (cachedRoleIds: string[]) =>
  Object.fromEntries(
    cachedRoleIds.map((roleId) => [roleId, NO_ROLE_RECORDS_PERMISSIONS]),
  );

describe('arePermissionsPrincipalsRolesCached', () => {
  it('accepts principals whose roles are all cached', () => {
    expect(
      arePermissionsPrincipalsRolesCached({
        principals,
        rolesPermissions: buildRolesPermissions(ROLE_IDS),
      }),
    ).toBe(true);
  });

  it.each(ROLE_IDS)(
    'rejects principals when %s is missing from the cache',
    (missingRoleId) => {
      expect(
        arePermissionsPrincipalsRolesCached({
          principals,
          rolesPermissions: buildRolesPermissions(
            ROLE_IDS.filter((roleId) => roleId !== missingRoleId),
          ),
        }),
      ).toBe(false);
    },
  );
});
