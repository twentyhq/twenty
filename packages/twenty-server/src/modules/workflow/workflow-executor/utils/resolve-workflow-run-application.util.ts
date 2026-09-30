import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export const resolveWorkflowRunApplication = <
  TApplication extends Pick<
    FlatApplication,
    'name' | 'deletedAt' | 'defaultRoleId'
  >,
>({
  workflowRun,
  applicationsById,
}: {
  workflowRun: Pick<WorkflowRunWorkspaceEntity, 'createdBy'>;
  applicationsById: Partial<Record<string, TApplication>>;
}): TApplication | null => {
  const applicationId = workflowRun.createdBy.context?.applicationId;

  if (!isDefined(applicationId)) {
    return null;
  }

  const application = applicationsById[applicationId];

  if (!isDefined(application) || isDefined(application.deletedAt)) {
    throw new WorkflowStepExecutorException(
      'The application this run acts through is no longer installed',
      WorkflowStepExecutorExceptionCode.FORBIDDEN,
    );
  }

  if (!isDefined(application.defaultRoleId)) {
    throw new WorkflowStepExecutorException(
      `Application "${application.name}" has no role, so its workflow steps cannot run`,
      WorkflowStepExecutorExceptionCode.FORBIDDEN,
    );
  }

  return application;
};
