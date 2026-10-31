import { isDefined } from 'twenty-shared/utils';

import {
  type ApplicationWithRuntimeRole,
  getApplicationRuntimeRoleId,
  isApplicationGrantExempt,
} from 'src/engine/core-modules/application/application-grant/utils/get-application-runtime-role-id.util';
import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

// Temporary: an exempt application (Twenty standard, workspace custom) without a role adds no
// restriction when it acts with a member or an agent. A confined application without a grant has no access.
export const resolveApplicationRoleId = ({
  application,
  isMissingApplicationRoleTolerated,
}: {
  application: ApplicationWithRuntimeRole | undefined;
  isMissingApplicationRoleTolerated: boolean;
}): Pick<RoleIdsBySource, 'applicationRoleId'> => {
  if (!isDefined(application)) {
    return isMissingApplicationRoleTolerated ? {} : { applicationRoleId: null };
  }

  const applicationRoleId = getApplicationRuntimeRoleId(application);

  if (isDefined(applicationRoleId)) {
    return { applicationRoleId };
  }

  return isMissingApplicationRoleTolerated &&
    isApplicationGrantExempt(application)
    ? {}
    : { applicationRoleId: null };
};
