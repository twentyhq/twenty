import { isDefined } from 'twenty-shared/utils';

import { resolveApplicationGrantRoleId } from 'src/engine/core-modules/application/application-grant-role/utils/resolve-application-grant-role-id.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export const resolveWorkflowRunApplicationOrThrow = <
  TApplication extends Pick<
    FlatApplication,
    'id' | 'name' | 'deletedAt' | 'defaultRoleId' | 'sourceType'
  >,
>({
  applicationId,
  applicationsById,
  workspaceId,
  workspaceCustomApplicationId,
  flatRoleTargetByApplicationIdMaps,
}: {
  applicationId: string;
  applicationsById: Partial<Record<string, TApplication>>;
  workspaceId: string;
  workspaceCustomApplicationId: string;
  flatRoleTargetByApplicationIdMaps: Partial<
    Record<string, Pick<FlatRoleTarget, 'roleId'>>
  >;
}): TApplication => {
  const application = applicationsById[applicationId];

  if (!isDefined(application) || isDefined(application.deletedAt)) {
    throw new WorkflowStepExecutorException(
      'The application this run acts through is no longer installed',
      WorkflowStepExecutorExceptionCode.FORBIDDEN,
    );
  }

  const grantRoleId = resolveApplicationGrantRoleId({
    flatApplication: application,
    workspaceId,
    workspaceCustomApplicationId,
    flatRoleTargetByApplicationIdMaps,
  });

  if (!isDefined(grantRoleId)) {
    throw new WorkflowStepExecutorException(
      `Application "${application.name}" has no role, so its workflow steps cannot run`,
      WorkflowStepExecutorExceptionCode.FORBIDDEN,
    );
  }

  return application;
};
