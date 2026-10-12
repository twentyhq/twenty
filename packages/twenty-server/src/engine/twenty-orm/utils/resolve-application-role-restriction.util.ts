import { isDefined } from 'twenty-shared/utils';

import { type RoleRestrictionsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

// An application without a role restricts nothing when it acts with a member or an agent
export const resolveApplicationRoleRestriction = ({
  application,
  isActingAlone,
}: {
  application: { defaultRoleId: string | null } | undefined;
  isActingAlone: boolean;
}): Pick<RoleRestrictionsBySource, 'application'> => {
  const applicationRoleId = application?.defaultRoleId;

  if (isDefined(applicationRoleId)) {
    return { application: applicationRoleId };
  }

  return isActingAlone ? { application: null } : {};
};
