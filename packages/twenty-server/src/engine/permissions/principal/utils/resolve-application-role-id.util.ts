import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';
import { type RoleIdsBySource } from 'src/engine/permissions/principal/types/role-permission-config.type';

// RoleIdsBySource tells no restriction (undefined) apart from allows nothing (null);
// we may want explicit literals for both instead of relying on that difference
const NO_APPLICATION_RESTRICTION = {} as const;

const APPLICATION_ALLOWS_NOTHING = { applicationRoleId: null } as const;

// OAuth-only applications have no role yet, so they act with the role of the member they act for
export const resolveApplicationRoleId = ({
  application,
  userRoleId,
}: {
  application:
    | Pick<FlatApplication, 'defaultRoleId' | 'sourceType'>
    | undefined;
  userRoleId?: string | null;
}): Pick<RoleIdsBySource, 'applicationRoleId'> => {
  if (!isDefined(application)) {
    return NO_APPLICATION_RESTRICTION;
  }

  if (isDefined(application.defaultRoleId)) {
    return { applicationRoleId: application.defaultRoleId };
  }

  return isOAuthOnlyApplication(application) && isDefined(userRoleId)
    ? { applicationRoleId: userRoleId }
    : APPLICATION_ALLOWS_NOTHING;
};
