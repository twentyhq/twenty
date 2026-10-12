import { isDefined } from 'twenty-shared/utils';

import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

// An application without a role restricts nothing when it acts with a member or an agent
export const resolveApplicationRoleRestriction = ({
  application,
  isActingAlone,
}: {
  application: { defaultRoleId: string | null } | undefined;
  isActingAlone: boolean;
}): Pick<RoleIdsBySource, 'applicationRoleId'> => {
  const applicationRoleId = application?.defaultRoleId;

  if (isDefined(applicationRoleId)) {
    return { applicationRoleId };
  }

  return isActingAlone ? { applicationRoleId: null } : {};
};
