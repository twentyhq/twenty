import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';
import { type RoleIdsBySource } from 'src/engine/permissions/principal/types/role-permission-config.type';

// RoleIdsBySource tells no restriction (undefined) apart from allows nothing (null);
// we may want explicit literals for both instead of relying on that difference
const NO_APPLICATION_RESTRICTION = {} as const;

const APPLICATION_ALLOWS_NOTHING = { applicationRoleId: null } as const;

// OAuth-only applications have no role, so they add no restriction to the member or agent they act with
export const resolveApplicationRoleId = ({
  application,
}: {
  application:
    | Pick<FlatApplication, 'defaultRoleId' | 'sourceType'>
    | undefined;
}): Pick<RoleIdsBySource, 'applicationRoleId'> => {
  if (!isDefined(application)) {
    return NO_APPLICATION_RESTRICTION;
  }

  if (isDefined(application.defaultRoleId)) {
    return { applicationRoleId: application.defaultRoleId };
  }

  return isOAuthOnlyApplication(application)
    ? NO_APPLICATION_RESTRICTION
    : APPLICATION_ALLOWS_NOTHING;
};
