import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export const buildApplicationWorkflowRolePermissionConfig = ({
  applications,
  userRoleId,
}: {
  applications: Pick<FlatApplication, 'name' | 'defaultRoleId'>[];
  userRoleId?: string;
}): RolePermissionConfig => {
  const applicationRoleIds = applications.map((application) => {
    if (!isDefined(application.defaultRoleId)) {
      throw new WorkflowStepExecutorException(
        `Application "${application.name}" has no role, so it cannot run workflow steps`,
        WorkflowStepExecutorExceptionCode.FORBIDDEN,
      );
    }

    return application.defaultRoleId;
  });

  return {
    intersectionOf: [
      ...new Set([
        ...(isDefined(userRoleId) ? [userRoleId] : []),
        ...applicationRoleIds,
      ]),
    ],
  };
};
