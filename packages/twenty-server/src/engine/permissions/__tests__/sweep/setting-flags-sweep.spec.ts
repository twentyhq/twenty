import {
  buildPrincipals,
  UNREAD_AUTH_CONTEXT,
} from 'src/engine/permissions/__tests__/framework/build-principals.util';
import {
  buildSettingPermissionsService,
  FLAG,
  isRoleGranting,
  ROLE_SETTINGS,
} from 'src/engine/permissions/__tests__/framework/build-setting-permissions-service.util';
import { findHeldRoles } from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  APPLICATION_ROLE_ID,
  LIMITING_ROLE_ID,
  MAIN_ROLE_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { buildReachablePrincipals } from 'src/engine/permissions/__tests__/sweep/reachable-principals.util';

describe('setting flags sweep', () => {
  it('requires every role the principals hold', async () => {
    const violations: string[] = [];

    for (const principals of buildReachablePrincipals({
      roles: ROLE_SETTINGS,
    })) {
      const { mainPrincipal, limitingPrincipal, applicationPrincipal } =
        principals;
      const isGranted = await buildSettingPermissionsService({
        settingByRoleId: {
          [MAIN_ROLE_ID]: mainPrincipal.role,
          ...(limitingPrincipal.type === 'agent' && {
            [LIMITING_ROLE_ID]: limitingPrincipal.role,
          }),
          ...(applicationPrincipal.type === 'application' && {
            [APPLICATION_ROLE_ID]: applicationPrincipal.role,
          }),
        },
        principals: buildPrincipals(principals),
      }).hasPermissionFlag({
        authContext: UNREAD_AUTH_CONTEXT,
        permissionFlag: FLAG,
      });

      if (isGranted !== findHeldRoles(principals).every(isRoleGranting)) {
        violations.push(JSON.stringify(principals));
      }
    }

    expect(violations).toEqual([]);
  });
});
