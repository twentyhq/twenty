import { isDefined } from 'twenty-shared/utils';

import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

// Temporary: an application without a role adds no restriction when it acts with a
// member or an agent, which the workspace custom and Twenty standard applications rely on
// until they get a role. It covers every application without a role, not only those two.
export const resolveApplicationRoleId = ({
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
