import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { resolveRoleIdsForUser } from 'src/engine/twenty-orm/utils/resolve-role-ids-for-user.util';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export const buildApplicationWorkflowRolePermissionConfig = ({
  owningApplication,
  userRoleId,
}: {
  owningApplication: Pick<FlatApplication, 'name' | 'defaultRoleId'>;
  userRoleId?: string;
}): RolePermissionConfig => {
  if (!isDefined(owningApplication.defaultRoleId)) {
    throw new WorkflowStepExecutorException(
      `Application "${owningApplication.name}" has no role, so its workflows cannot run steps`,
      WorkflowStepExecutorExceptionCode.FORBIDDEN,
    );
  }

  if (!isDefined(userRoleId)) {
    return { intersectionOf: [owningApplication.defaultRoleId] };
  }

  return {
    intersectionOf: resolveRoleIdsForUser({
      userRoleId,
      applicationRoleId: owningApplication.defaultRoleId,
    }),
  };
};
