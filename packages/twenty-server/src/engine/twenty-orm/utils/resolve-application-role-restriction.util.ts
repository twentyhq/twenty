import { isDefined } from 'twenty-shared/utils';

import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

// Temporary: the workspace custom and Twenty standard applications have no role yet,
// so acting with a member or an agent they must not restrict. Drop once they get one.
export const resolveApplicationRoleRestriction = ({
  application,
  isMissingApplicationRoleTolerated,
}: {
  application: { defaultRoleId: string | null } | undefined;
  isMissingApplicationRoleTolerated: boolean;
}): Pick<RoleIdsBySource, 'applicationRoleId'> => {
  const applicationRoleId = application?.defaultRoleId;

  if (isDefined(applicationRoleId)) {
    return { applicationRoleId };
  }

  return isMissingApplicationRoleTolerated ? {} : { applicationRoleId: null };
};
